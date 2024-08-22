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

export const generatePushNotificationFromEvent = async (event: WebSocketMessageEvent) => {
  const appConfig = await getAppConfig();
  const notificationData = JSON.parse(event.data) as SocketNotificationData;
  const notificationType = SocketNotificationData.getType(notificationData);
  let channel = serviceChannel;
  let url = '';
  let pressActionID = PressAction.twitarrTab;
  let title = '';
  let autoCancel = true;
  let ongoing = false;

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

  switch (notificationType) {
    case NotificationTypeData.seamailUnreadMsg:
      channel = seamailChannel;
      url = `/seamail/${notificationData.contentID}`;
      pressActionID = PressAction.seamail;
      title = 'New Seamail';
      break;
    case NotificationTypeData.fezUnreadMsg:
      channel = lfgChannel;
      url = `/lfg/${notificationData.contentID}/chat`;
      pressActionID = PressAction.lfg;
      title = 'New LFG Message';
      break;
    case NotificationTypeData.announcement:
      channel = announcementsChannel;
      url = '/home';
      pressActionID = PressAction.home;
      title = 'Announcement';
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
      url = `/personalevents/${notificationData.contentID}`;
      break;
  }

  generateContentNotification(
    notificationData.contentID,
    title,
    notificationData.info,
    channel,
    notificationType,
    url,
    pressActionID,
    autoCancel,
    ongoing,
  );
};
