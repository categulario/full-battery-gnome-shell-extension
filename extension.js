const Main = imports.ui.main;
const MessageTray = imports.ui.messageTray;
const PowerIndicator = Main.panel.statusArea.aggregateMenu._power;
const Gettext = imports.gettext;
const _ = Gettext.domain('fullbattery').gettext;
const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const UPower = imports.gi.UPowerGlib;

const BATTERY_FULL_ICON = 'battery-full-charged-symbolic';
const BATTERY_LOW_ICON = 'battery-low-symbolic';

const Gio = imports.gi.Gio;
const fullBatterySound = Gio.File.new_for_path('/usr/share/sounds/gnome/default/alerts/drip.ogg');
const lowBatterySound = Gio.File.new_for_path('/usr/share/sounds/gnome/default/alerts/sonar.ogg');

let _notifSource = null;
let signals = [];
let data_method = "native";
let notification = null;

function _initNotifSource(message) {
    if (!_notifSource) {
        _notifSource = new MessageTray.Source('FullBatteryIndicator', BATTERY_FULL_ICON);
    	if (message.includes('low')) {
        	_notifSource = new MessageTray.Source('LowBatteryIndicator', BATTERY_LOW_ICON);
    	}
        _notifSource.connect('destroy', function() {
            _notifSource = null;
        });
        Main.messageTray.add(_notifSource);
    }
}

function _showNotification(message, urgent) {
    _initNotifSource(message);

    if (_notifSource.count === 0) {
        notification = new MessageTray.Notification(_notifSource, message);
    } else {
        notification = _notifSource.notifications[0];
        notification.update(message, '', { clear: true });
    }

    if (urgent) {
      notification.setUrgency(MessageTray.Urgency.CRITICAL);
    } else {
      notification.setUrgency(MessageTray.Urgency.NORMAL);
    }
    
    let player = global.display.get_sound_player();
    
    if (message.includes('low')) {
    	player.play_from_file(lowBatterySound, 'Connect charger!', null);
    } else {
    	player.play_from_file(fullBatterySound, 'Disconnect charger!', null);
    }
    
    notification.setTransient(true);
    _notifSource.notify(notification);
}

function _hideNotification() {
  if (notification) {
    notification.destroy(MessageTray.NotificationDestroyedReason.SOURCE_CLOSED);
    notification = null;
  }
}

function read_battery() {
  switch (data_method) {
  default:
  case "native":
    return [PowerIndicator._proxy.TimeToEmpty,
            PowerIndicator._proxy.TimeToFull,
            PowerIndicator._proxy.Percentage,
            PowerIndicator._proxy.IsPresent,
            PowerIndicator._proxy.State];
  case "device":
    let devices = PowerIndicator._proxy.GetDevicesSync();
    let n_devs = 0;
    let is_present = false;
    let tte_s = 0;
    let ttf_s = 0;
    let per_c = 0;
    let out_state = UPower.DeviceState.EMPTY;

    for (let i = 0; i < devices.length; ++i) {
      for (let j = 0; j < devices[i].length; ++j) {
        let [id, type, icon, percent, state, time] = devices[i][j];

        if (type != UPower.DeviceKind.BATTERY) {
          continue;
        }

        ++n_devs;

        is_present  = true;
        tte_s      += time;
        ttf_s       = tte_s;
        // Round the total percentage for multiple batteries
        per_c       = ((per_c * (n_devs - 1)) + percent) / n_devs;

        // charging > discharging > full > empty
        // Ignore the other states.

        switch (state) {
        case UPower.DeviceState.DISCHARGING:
        case UPower.DeviceState.PENDING_DISCHARGE:
          if (out_state != UPower.DeviceState.CHARGING) {
            out_state = UPower.DeviceState.DISCHARGING;
          }
          break;
        case UPower.DeviceState.CHARGING:
        case UPower.DeviceState.PENDING_CHARGE:
          out_state = UPower.DeviceState.CHARGING;
          break;
        case UPower.DeviceState.FULLY_CHARGED:
          if (out_state != UPower.DeviceState.CHARGING
              && out_state != UPower.DeviceState.DISCHARGING) {
            out_state = UPower.DeviceState.FULLY_CHARGED;
          }
          break;
        default:
          break;
        }
      }
    }

    return [tte_s, ttf_s, per_c, is_present, out_state];
  }
}

function _update() {
  let [tte_s, ttf_s, per_c, is_present, state] = read_battery();

  /*
  CHARGING          : 1
  DISCHARGING       : 2
  FULLY_CHARGED     : 4
  PENDING_CHARGE    : 5
  PENDING_DISCHARGE : 6
  */

  if (state == UPower.DeviceState.FULLY_CHARGED || per_c > 97) {
    _showNotification(_('Battery fully charged. Disconnect charger'), true);
  } else if (state == UPower.DeviceState.CHARGING && Math.abs(100-per_c) < 11){
    _showNotification(_('Battery close to full charge: %d%%').format(per_c));
  } else if (state == UPower.DeviceState.DISCHARGING && per_c < 21){
    _showNotification(_('Battery low: %d%%').format(per_c), true);
  } else {
    _hideNotification();
  }
}

function init() {
  let localeDir = Me.dir.get_child('locale');
  Gettext.bindtextdomain('fullbattery', localeDir.get_path());
}

function enable() {
  if ("GetDevicesSync" in PowerIndicator._proxy) {
    data_method = "device";
  } else {
    data_method = "native";
  }

  signals.push([
    PowerIndicator._proxy,
    PowerIndicator._proxy.connect('g-properties-changed', _update),
  ]);
}

function disable() {
  while (signals.length > 0) {
    let [obj, sig] = signals.pop();
    obj.disconnect(sig);
  }
}
