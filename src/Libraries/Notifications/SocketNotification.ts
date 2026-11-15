import notifee, {EventType, Notification, NotificationPressAction} from 'react-native-notify-kit';

import {PressAction} from '#src/Enums/Notifications';
import {createLogger} from '#src/Libraries/Logger';
import {getPath} from '#src/Libraries/RouteDefinitions';
import {CommonStackComponents, CommonStackParamList} from '#src/Navigation/Stacks/Common/CommonStackComponents';
import {MainStackComponents} from '#src/Navigation/Stacks/Main/MainStackComponents';
import {SettingsStackScreenComponents} from '#src/Navigation/Stacks/Settings/SettingsStackComponents';
import {BottomTabComponents} from '#src/Navigation/Tabs/Bottom/BottomTabComponents';
import {NotificationTypeData} from '#src/Structs/SocketStructs';

const logger = createLogger('SocketNotification.ts');

export type NotificationEventDestination =
  {tab: BottomTabComponents; screen: string; params?: object} | {screen: keyof CommonStackParamList; params?: object};

/**
 * Where tapping content for a notification event should navigate (notification log, etc.).
 * Most destinations are Common Stack screens pushed on the caller's current stack so back
 * returns to the log. `tab` is set only when the destination is a tab root (announcement).
 * Returns undefined for types with no in-app destination (e.g. phone call lifecycle events).
 */
export const getNotificationEventDestination = (
  type: string,
  contentID: string,
): NotificationEventDestination | undefined => {
  switch (type as keyof typeof NotificationTypeData) {
    case NotificationTypeData.seamailUnreadMsg:
    case NotificationTypeData.addedToSeamail:
      return {screen: CommonStackComponents.seamailChatScreen, params: {fezID: contentID}};
    case NotificationTypeData.fezUnreadMsg:
      return {screen: CommonStackComponents.lfgChatScreen, params: {fezID: contentID}};
    case NotificationTypeData.announcement:
      // MainScreen is the home tab's own root screen, not a Common Stack screen, so this one
      // genuinely has to switch tabs.
      return {tab: BottomTabComponents.homeTab, screen: MainStackComponents.mainScreen};
    case NotificationTypeData.alertwordPost:
    case NotificationTypeData.twitarrTeamForumMention:
    case NotificationTypeData.moderatorForumMention:
      return {screen: CommonStackComponents.forumThreadPostScreen, params: {postID: contentID}};
    case NotificationTypeData.forumMention:
      return {screen: CommonStackComponents.forumPostMentionScreen};
    case NotificationTypeData.followedEventStarting:
      return {screen: CommonStackComponents.eventScreen, params: {eventID: contentID}};
    case NotificationTypeData.joinedLFGStarting:
    case NotificationTypeData.addedToLFG:
    case NotificationTypeData.lfgCanceled:
      return {screen: CommonStackComponents.lfgScreen, params: {fezID: contentID}};
    case NotificationTypeData.personalEventStarting:
    case NotificationTypeData.privateEventCanceled:
    case NotificationTypeData.addedToPrivateEvent:
      return {screen: CommonStackComponents.personalEventScreen, params: {eventID: contentID}};
    case NotificationTypeData.privateEventUnreadMsg:
      return {screen: CommonStackComponents.privateEventChatScreen, params: {fezID: contentID}};
    default:
      return undefined;
  }
};

/**
 * Determine a React Navigation URL based on a notification event. This is called from the
 * AppEventHandler.tsx when the app receives a foreground or background socket event.
 * Generally if you've made it here you're trying to trigger some navigation to take you
 * somewhere useful based on event.
 */
export const getUrlForNotificationEvent = (
  type: EventType,
  notification?: Notification,
  pressAction?: NotificationPressAction,
): string | undefined => {
  if (!notification || !pressAction) {
    return;
  }
  logger.debug('Got press action:', pressAction);
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
        return `/${getPath(SettingsStackScreenComponents.backgroundConnectionSettings)}`;
      }
      case PressAction.contentSettings: {
        const baseUrl = '/settings/pushnotifications';
        if (notification.data?.type && typeof notification.data.type === 'string') {
          return `${baseUrl}?notificationType=${encodeURIComponent(notification.data.type)}`;
        }
        return baseUrl;
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
      case PressAction.personalEvent: {
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
