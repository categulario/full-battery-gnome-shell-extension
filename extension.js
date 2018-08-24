const St = imports.gi.St;
const Main = imports.ui.main;
const MessageTray = imports.ui.messageTray;

let button, _notifSource;

const INDICATOR_ICON = 'battery-full-charged-symbolic';

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
        notification.urgency = MessageTray.Urgency.CRITICAL;
    }
    else {
        notification = _notifSource.notifications[0];
        notification.update(message, '', { clear: true });
    }

    notification.setTransient(true);
    _notifSource.notify(notification);
}

function _showHello() {
  _showNotification('Batería completamente cargada, desconecta el cargador');
}

function init() {
  button = new St.Bin({
    style_class: 'panel-button',
    reactive: true,
    can_focus: true,
    x_fill: true,
    y_fill: false,
    track_hover: true,
  });

  let icon = new St.Icon({
    icon_name: 'system-run-symbolic',
    style_class: 'system-status-icon',
  });

  button.set_child(icon);
  button.connect('button-press-event', _showHello);
}

function enable() {
    Main.panel._rightBox.insert_child_at_index(button, 0);
}

function disable() {
    Main.panel._rightBox.remove_child(button);
}
