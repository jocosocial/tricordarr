import notifee, {EventType, Notification, NotificationPressAction} from '@notifee/react-native';
import {PressAction} from './Enums/Notifications';
import {NotificationTypeData} from './Structs/SocketStructs';

/**
 * Determine a React Navigation URL based on a notification event.
 */
export const getUrlForEvent = (
  type: EventType,
  notification?: Notification,
  pressAction?: NotificationPressAction,
): string | undefined => {
  if (!notification || !pressAction) {
    return;
  }
  console.log('[Events.ts] Got press action:', pressAction);
  if (type === EventType.PRESS || type === EventType.ACTION_PRESS) {
    switch (pressAction.id) {
      case PressAction.twitarrTab: {
        if (notification.id) {
          notifee.cancelNotification(notification.id);
          // The Webview won't reload if the route doesn't change, so we inject the current timestamp
          // as a "key" to make Navigation / Webview think that the value has changed.
          let url = `/twitarrtab/${Date.now()}`;
          // Only build URLs for handled types
          switch (notification.data?.type) {
            case NotificationTypeData.seamailUnreadMsg:
              url += notification.data.url;
              break;
            case NotificationTypeData.fezUnreadMsg:
              url += notification.data.url;
              break;
          }
          return url;
        }
        return;
      }
      case PressAction.worker: {
        return '/settings/serverconnectionsettingsscreen';
      }
      case PressAction.contentSettings: {
        return '/settings/pushnotifications';
      }
      // @TODO dedupe these into a single content press type
      case PressAction.seamail: {
        if (notification.id && notification.data) {
          notifee.cancelNotification(notification.id);
          return `${notification.data.url}`;
        }
        return;
      }
      case PressAction.lfg: {
        if (notification.id && notification.data) {
          notifee.cancelNotification(notification.id);
          return `${notification.data.url}`;
        }
        return;
      }
      case PressAction.forum: {
        if (notification.id && notification.data) {
          notifee.cancelNotification(notification.id);
          return `${notification.data.url}`;
        }
        return;
      }
      case PressAction.krakentalk: {
        if (notification.id && notification.data) {
          return `${notification.data.url}`;
        }
        return;
      }
      case PressAction.event: {
        if (notification.id && notification.data) {
          notifee.cancelNotification(notification.id);
          return `${notification.data.url}`;
        }
        return;
      }
      case PressAction.home: {
        if (notification.id && notification.data) {
          notifee.cancelNotification(notification.id);
          // SocketNotifications.ts sets the URL for these to `/home`.
          // return `${notification.data.url}`;
          return '/home';
        }
      }
    }
  }
};
