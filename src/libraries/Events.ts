import notifee, {EventType, Notification, NotificationPressAction} from '@notifee/react-native';
import {PressAction, NotificationType} from './Enums/Notifications';

export function handleEvent(type: EventType, notification: Notification, pressAction: NotificationPressAction) {
  // Someday we may add a 'mark as read' button to content notifications.
  // if (type === EventType.ACTION_PRESS && pressAction.id === 'mark-as-read') {

  console.log('Got press action:', pressAction);
  if (type === EventType.PRESS && pressAction.id === PressAction.twitarrTab) {
    if (notification.id) {
      notifee.cancelNotification(notification.id);
    }

    let url = `/twitarrtab/${Date.now()}`;

    // Only build URLs for handled types
    switch (notification.data?.type) {
      case NotificationType.seamailUnreadMsg:
        url += notification.data.url;
        break;
      case NotificationType.fezUnreadMsg:
        url += notification.data.url;
        break;
    }

    return url;
  }

  if (type === EventType.PRESS && pressAction.id === PressAction.worker) {
    return '/settingstab/serverconnectionsettingsscreen';
  }
}
