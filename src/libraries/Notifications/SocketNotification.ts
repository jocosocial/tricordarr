import {SocketNotificationData} from '../Structs/SocketStructs';
import {lfgChannel, seamailChannel, serviceChannel} from './Channels';
import {NotificationType, PressAction} from '../Enums/Notifications';
import {generateContentNotification} from './Content';
import {getAppConfig} from '../AppConfig';

export const generatePushFromEvent = async (event: WebSocketMessageEvent) => {
  const appConfig = await getAppConfig();
  const notificationData = JSON.parse(event.data) as SocketNotificationData;
  const notificationType = SocketNotificationData.getType(notificationData);
  let channel = serviceChannel;
  let url = '';
  let pressActionID = PressAction.twitarrTab;
  let title = '';

  // Do not generate a notification if the user has disabled that category.
  if (!appConfig.pushNotifications[notificationType]) {
    return;
  }

  switch (notificationType) {
    case NotificationType.seamailUnreadMsg:
      channel = seamailChannel;
      url = `/seamail/${notificationData.contentID}`;
      pressActionID = PressAction.seamail;
      title = 'New Seamail';
      break;
    case NotificationType.fezUnreadMsg:
      channel = lfgChannel;
      url = `/fez/${notificationData.contentID}#newposts`;
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
  );
};
