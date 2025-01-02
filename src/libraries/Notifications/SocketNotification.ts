import {NotificationTypeData, SocketNotificationData} from '../Structs/SocketStructs';
import {
  announcementsChannel,
  callMgmtChannel,
  callsChannel,
  eventChannel,
  forumChannel,
  lfgChannel,
  seamailChannel,
  serviceChannel,
} from './Channels';
import {PressAction} from '../Enums/Notifications';
import {generateContentNotification} from './Content';
import {getAppConfig} from '../AppConfig';
import notifee, {EventType, Notification, NotificationPressAction} from '@notifee/react-native';

/**
 * Generate a Notifee notification from a WebSocket event. This usually means that something
 * has come in from the socket, and we probably want to tell the user about it.
 * @param event WebSocketMessageEvent payload.
 */
export const generatePushNotificationFromEvent = async (event: WebSocketMessageEvent) => {
  const appConfig = await getAppConfig();
  const notificationData = JSON.parse(event.data) as SocketNotificationData;
  const notificationType = SocketNotificationData.getType(notificationData);

  let channel = serviceChannel;
  let url = '';
  let pressActionID = PressAction.twitarrTab;
  let title = '';
  let autoCancel = false;
  let ongoing = false;
  let markAsReadUrl: string | undefined;

  // Do not generate a notification if the user has disabled that category.
  if (!appConfig.pushNotifications[notificationType]) {
    console.log('[SocketNotification.ts] user has disabled category', notificationType);
    return;
  }

  // Do not generate a notification if the user has muted notifications.
  if (appConfig.muteNotifications) {
    if (new Date() < appConfig.muteNotifications) {
      console.log('[SocketNotification.ts] user has muted notifications.');
      return;
    }
  }

  console.log('[SocketNotification.ts] Responding to message with type', notificationType);

  // Figure out what we want to display and how to display it.
  // Whenever you add notification types here, there needs to be entries in
  // AppConfig for them as well.
  switch (notificationType) {
    case NotificationTypeData.seamailUnreadMsg:
      channel = seamailChannel;
      url = `/seamail/${notificationData.contentID}`;
      pressActionID = PressAction.seamail;
      title = 'New Seamail';
      markAsReadUrl = `/fez/${notificationData.contentID}`;
      break;
    case NotificationTypeData.fezUnreadMsg:
      channel = lfgChannel;
      url = `/lfg/${notificationData.contentID}/chat`;
      pressActionID = PressAction.lfg;
      title = 'New LFG Message';
      markAsReadUrl = `/fez/${notificationData.contentID}`;
      break;
    case NotificationTypeData.announcement:
      channel = announcementsChannel;
      url = '/home';
      pressActionID = PressAction.home;
      title = 'Announcement';
      markAsReadUrl = '/user/notification/global';
      break;
    case NotificationTypeData.alertwordPost:
      channel = forumChannel;
      url = `/forum/containingpost/${notificationData.contentID}`;
      pressActionID = PressAction.forum;
      title = 'Forum Alert Word';
      break;
    case NotificationTypeData.forumMention:
      channel = forumChannel;
      url = '/forumpost/mentions';
      pressActionID = PressAction.forum;
      title = 'Forum Mention';
      break;
    case NotificationTypeData.twitarrTeamForumMention:
      channel = forumChannel;
      url = `/forum/containingpost/${notificationData.contentID}`;
      pressActionID = PressAction.forum;
      title = 'TwitarrTeam Forum Mention';
      break;
    case NotificationTypeData.moderatorForumMention:
      channel = forumChannel;
      url = `/forum/containingpost/${notificationData.contentID}`;
      pressActionID = PressAction.forum;
      title = 'Moderator Forum Mention';
      break;
    case NotificationTypeData.incomingPhoneCall:
      channel = callsChannel;
      pressActionID = PressAction.krakentalk;
      url = `/phonecall/${notificationData.contentID}/from/${notificationData.caller?.userID}/${notificationData.caller?.username}`;
      title = 'Incoming Call';
      autoCancel = false;
      ongoing = true;
      break;
    case NotificationTypeData.phoneCallEnded:
      channel = callMgmtChannel;
      pressActionID = PressAction.krakentalk;
      title = 'Call Ended';
      break;
    case NotificationTypeData.followedEventStarting:
      channel = eventChannel;
      pressActionID = PressAction.event;
      title = 'Followed Event Starting';
      url = `/events/${notificationData.contentID}`;
      break;
    case NotificationTypeData.joinedLFGStarting:
      channel = lfgChannel;
      pressActionID = PressAction.lfg;
      title = 'Joined LFG Starting';
      url = `/lfg/${notificationData.contentID}`;
      break;
    case NotificationTypeData.personalEventStarting:
      channel = eventChannel;
      pressActionID = PressAction.personalEvent;
      title = 'Personal Event Starting';
      url = `/privateevent/${notificationData.contentID}`;
      break;
    case NotificationTypeData.addedToPrivateEvent:
      channel = eventChannel;
      pressActionID = PressAction.personalEvent;
      title = 'Added to Private Event';
      url = `/privateevent/${notificationData.contentID}`;
      break;
    case NotificationTypeData.addedToLFG:
      channel = lfgChannel;
      pressActionID = PressAction.lfg;
      title = 'Added to LFG';
      url = `/lfg/${notificationData.contentID}`;
      break;
    case NotificationTypeData.addedToSeamail:
      channel = seamailChannel;
      pressActionID = PressAction.seamail;
      title = 'Added to Seamail';
      url = `/seamail/${notificationData.contentID}`;
      break;
    case NotificationTypeData.privateEventCanceled:
      channel = eventChannel;
      pressActionID = PressAction.event;
      title = 'Private Event Canceled';
      url = `/privateevent/${notificationData.contentID}`;
      break;
    case NotificationTypeData.lfgCanceled:
      channel = lfgChannel;
      pressActionID = PressAction.lfg;
      title = 'LFG Canceled';
      url = `/lfg/${notificationData.contentID}`;
      break;
    default:
      console.warn(`[SocketNotification.ts] Ignoring event of type ${notificationType}`);
      break;
  }

  console.info(`[SocketNotification.ts] Calling generateContentNotification() for type ${notificationType}`);
  await generateContentNotification(
    notificationData.contentID,
    title,
    notificationData.info,
    channel,
    notificationType,
    url,
    pressActionID,
    autoCancel,
    ongoing,
    markAsReadUrl,
  );
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
  console.log('[SocketNotification.ts] Got press action:', pressAction);
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
