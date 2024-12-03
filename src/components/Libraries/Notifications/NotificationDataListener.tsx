import {useUserNotificationData} from '../../Context/Contexts/UserNotificationDataContext';
import {useCallback, useEffect} from 'react';
import {useAppState} from '@react-native-community/hooks';
import {useSocket} from '../../Context/Contexts/SocketContext';
import {NotificationTypeData, SocketNotificationData} from '../../../libraries/Structs/SocketStructs';
import {useAnnouncementsQuery} from '../../Queries/Alert/AnnouncementQueries.ts';
import {useAuth} from '../../Context/Contexts/AuthContext';
import {useQueryClient} from '@tanstack/react-query';
import {useUserNotificationDataQuery} from '../../Queries/Alert/NotificationQueries';

/**
 * Functional component to respond to Notification Socket events from Swiftarr.
 * This is only responsible for any responses that should be processed within the React UI.
 * This is NOT responsible for push notifications.
 */
export const NotificationDataListener = () => {
  const {enableUserNotifications} = useUserNotificationData();
  const {refetch: refetchUserNotificationData} = useUserNotificationDataQuery();
  const appStateVisible = useAppState();
  const {notificationSocket} = useSocket();
  const {refetch: refetchAnnouncements} = useAnnouncementsQuery({enabled: false});
  const {isLoggedIn} = useAuth();
  const queryClient = useQueryClient();

  const wsMessageHandler = useCallback(
    (event: WebSocketMessageEvent) => {
      console.log(`[NotificationDataListener.tsx] wsMessageHandler received data from server: ${event.data}`);
      const notificationData = JSON.parse(event.data) as SocketNotificationData;
      const notificationType = SocketNotificationData.getType(notificationData);
      // Always refetch the UserNotificationData when we got a socket event.
      refetchUserNotificationData();

      // Some kinds of socket events should update other areas of the state.
      switch (notificationType) {
        case NotificationTypeData.announcement: {
          refetchAnnouncements();
          break;
        }
        case NotificationTypeData.seamailUnreadMsg: {
          queryClient.invalidateQueries({queryKey: [`/fez/${notificationData.contentID}`]});
          break;
        }
      }
    },
    [queryClient, refetchAnnouncements, refetchUserNotificationData],
  );

  const addHandler = useCallback(() => {
    console.log('[NotificationDataListener.tsx] Adding handler.');
    notificationSocket?.addEventListener('message', wsMessageHandler);
  }, [notificationSocket, wsMessageHandler]);

  const removeHandler = useCallback(() => {
    console.log('[NotificationDataListener.tsx] Removing handler.');
    notificationSocket?.removeEventListener('message', wsMessageHandler);
  }, [notificationSocket, wsMessageHandler]);

  useEffect(() => {
    // The check for active state may be redundant since the notification socket is only open
    // when the app is running. At least for now...
    // This effect does have the effect of removing the handler twice when the app
    // goes to background. I think this is acceptable to ensure that the handler gets removed.
    if (enableUserNotifications && appStateVisible === 'active' && isLoggedIn) {
      addHandler();
    } else {
      removeHandler();
    }
    console.log(
      '[NotificationDataListener.tsx] useEffect state is',
      enableUserNotifications,
      appStateVisible,
      isLoggedIn,
    );
    return () => removeHandler();
  }, [addHandler, appStateVisible, enableUserNotifications, removeHandler, isLoggedIn]);

  return null;
};
