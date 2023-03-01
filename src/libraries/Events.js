import notifee, {EventType} from '@notifee/react-native';
import {NotificationType} from './Enums/NotificationType';

export function handleEvent(type, notification, pressAction) {
  // Check if the user pressed the "Mark as read" action
  if (type === EventType.ACTION_PRESS && pressAction.id === 'mark-as-read') {
    // Do something
    // Remove the notification
    notifee.cancelNotification(notification.id);
  }

  if (type === EventType.PRESS) {
    notifee.cancelNotification(notification.id);

    let url = `/twitarrtab/${Date.now()}`;

    // Only build URLs for handled types
    switch (notification.data.type) {
      case NotificationType.seamailUnreadMsg:
        url += notification.data.url;
        break;
    }

    return url;
  }
}
