import {NotificationTypeData, SocketNotificationData} from '../Structs/SocketStructs';
import {
  announcementsChannel,
  forumChannel,
  callsChannel,
  lfgChannel,
  seamailChannel,
  serviceChannel, callMgmtChannel,
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
    // Be careful about this ordering!
    case NotificationTypeData.twitarrTeamForumMention:
    case NotificationTypeData.moderatorForumMention:
    case NotificationTypeData.forumMention:
      channel = forumChannel;
      url = `/forum/containingpost/${notificationData.contentID}`;
      pressActionID = PressAction.forum;
      title = 'Forum Mention';
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
