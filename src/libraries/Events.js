import notifee, {EventType} from '@notifee/react-native';
import {NotificationPressAction, NotificationType} from './Enums/Notifications';

export function handleEvent(type, notification, pressAction) {
  // Someday we may add a 'mark as read' button to content notifications.
  // if (type === EventType.ACTION_PRESS && pressAction.id === 'mark-as-read') {

  if (type === EventType.PRESS && pressAction.id === NotificationPressAction.twitarrTab) {
    notifee.cancelNotification(notification.id);

    let url = `/twitarrtab/${Date.now()}`;

    // Only build URLs for handled types
    switch (notification.data.type) {
      case NotificationType.seamailUnreadMsg:
        url += notification.data.url;
        break;
      case NotificationType.fezUnreadMsg:
        url+= notification.data.url;
        break;
    }

    return url;
  }

  if (type === EventType.PRESS && pressAction.id === NotificationPressAction.worker) {
    return '/settingstab/serverconnectionsettingsscreen';
  }
}
