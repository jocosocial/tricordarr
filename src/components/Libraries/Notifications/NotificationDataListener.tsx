import {useUserNotificationData} from '../../Context/Contexts/UserNotificationDataContext';
import {useCallback, useEffect} from 'react';
import {useAppState} from '@react-native-community/hooks';
import {useSocket} from '../../Context/Contexts/SocketContext';
import {SocketNotificationData} from '../../../libraries/Structs/SocketStructs';
import {lfgChannel, seamailChannel, serviceChannel} from '../../../libraries/Notifications/Channels';
import {NotificationType, PressAction} from '../../../libraries/Enums/Notifications';
import {generateContentNotification} from '../../../libraries/Notifications/Content';
import {useConfig} from '../../Context/Contexts/ConfigContext';

export const NotificationDataListener = () => {
  const {enableUserNotifications, refetchUserNotificationData} = useUserNotificationData();
  const appStateVisible = useAppState();
  const {notificationSocket} = useSocket();
  const {appConfig} = useConfig();

  const wsMessageHandler = useCallback(
    (event: WebSocketMessageEvent) => {
      console.log(`[message] Data received from server: ${event.data}`);
      refetchUserNotificationData();
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
    },
    [appConfig.pushNotifications, refetchUserNotificationData],
  );

  const addHandler = useCallback(() => {
    console.log('UNDListener adding handler.');
    notificationSocket?.addEventListener('message', wsMessageHandler);
  }, [notificationSocket, wsMessageHandler]);
  const removeHandler = useCallback(() => {
    console.log('UNDListener removing handler.');
    notificationSocket?.addEventListener('message', wsMessageHandler);
  }, [notificationSocket, wsMessageHandler]);

  useEffect(() => {
    // The check for active state may be redundant since the notification socket is only open
    // when the app is running. At least for now...
    // This effect does have the effect of removing the handler twice when the app
    // goes to background. I think this is acceptable to ensure that the handler gets removed.
    if (enableUserNotifications && appStateVisible === 'active') {
      addHandler();
    } else {
      removeHandler();
    }
    return () => removeHandler();
  }, [addHandler, appStateVisible, enableUserNotifications, removeHandler]);

  return null;
};
