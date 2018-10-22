const Main = imports.ui.main;
const MessageTray = imports.ui.messageTray;
const PowerIndicator = Main.panel.statusArea.aggregateMenu._power;
const Gettext = imports.gettext;
const _ = Gettext.domain('fullbattery').gettext;
const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const UPower = imports.gi.UPowerGlib;

const INDICATOR_ICON = 'battery-full-charged-symbolic';

let _notifSource = null;
let signals = [];
let data_method = "native";

function _initNotifSource() {
    if (!_notifSource) {
        _notifSource = new MessageTray.Source('ClipboardIndicator',
                                INDICATOR_ICON);
        _notifSource.connect('destroy', function() {
            _notifSource = null;
        });
        Main.messageTray.add(_notifSource);
    }
}

function _showNotification(message) {
    let notification = null;

    _initNotifSource();

    if (_notifSource.count === 0) {
        notification = new MessageTray.Notification(_notifSource, message);
        notification.setUrgency(MessageTray.Urgency.CRITICAL);
    } else {
        notification = _notifSource.notifications[0];
        notification.update(message, '', { clear: true });
    }

    notification.setTransient(true);
    _notifSource.notify(notification);
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

  if (Math.abs(100-per_c) < 5 && state == UPower.DeviceState.CHARGING) {
    _showNotification(_('Battery fully charged. Disconnect charger'));
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
