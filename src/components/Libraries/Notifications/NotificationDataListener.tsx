import {useUserNotificationData} from '../../Context/Contexts/UserNotificationDataContext';
import {useCallback, useEffect} from 'react';
import {useAppState} from '@react-native-community/hooks';
import {useSocket} from '../../Context/Contexts/SocketContext';

/**
 * Functional component to respond to Notification Socket events from Swiftarr.
 * This is only responsible for any responses that should be processed within the React UI.
 * This is NOT responsible for push notifications.
 */
export const NotificationDataListener = () => {
  const {enableUserNotifications, refetchUserNotificationData} = useUserNotificationData();
  const appStateVisible = useAppState();
  const {notificationSocket} = useSocket();

  const wsMessageHandler = useCallback(
    (event: WebSocketMessageEvent) => {
      console.log(`[message] Data received from server: ${event.data}`);
      refetchUserNotificationData();
    },
    [refetchUserNotificationData],
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
