import {useAppState} from '@react-native-community/hooks';
import {useQueryClient} from '@tanstack/react-query';
import {useCallback, useEffect} from 'react';

import {useAuth} from '#src/Context/Contexts/AuthContext';
import {useConfig} from '#src/Context/Contexts/ConfigContext';
import {useEnableUserNotification} from '#src/Context/Contexts/EnableUserNotificationContext';
import {usePreRegistration} from '#src/Context/Contexts/PreRegistrationContext';
import {useSocket} from '#src/Context/Contexts/SocketContext';
import {useAnnouncementsQuery} from '#src/Queries/Alert/AnnouncementQueries';
import {useUserNotificationDataQuery} from '#src/Queries/Alert/NotificationQueries';
import {FezData} from '#src/Structs/ControllerStructs';
import {NotificationTypeData, SocketNotificationData} from '#src/Structs/SocketStructs';

/**
 * Functional component to respond to Notification Socket events from Swiftarr.
 * This is only responsible for any responses that should be processed within the React UI.
 * This is NOT responsible for push notifications.
 */
export const NotificationDataListener = () => {
  const {enableUserNotifications} = useEnableUserNotification();
  const {isLoggedIn} = useAuth();
  const {oobeCompleted, appConfig} = useConfig();
  const {preRegistrationMode} = usePreRegistration();
  const {refetch: refetchUserNotificationData} = useUserNotificationDataQuery({
    enabled: oobeCompleted && isLoggedIn && !preRegistrationMode,
  });
  const appStateVisible = useAppState();
  const {notificationSocket} = useSocket();
  const {refetch: refetchAnnouncements} = useAnnouncementsQuery({enabled: false});
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
        // The order matters here! Not the specifics of which case but that they
        // all fall through together.
        case NotificationTypeData.seamailUnreadMsg:
        case NotificationTypeData.privateEventUnreadMsg:
        case NotificationTypeData.fezUnreadMsg:
        case NotificationTypeData.addedToPrivateEvent:
        case NotificationTypeData.addedToLFG:
        case NotificationTypeData.lfgCanceled:
        case NotificationTypeData.privateEventCanceled:
        case NotificationTypeData.addedToSeamail: {
          const invalidations = FezData.getCacheKeys(notificationData.contentID).map(key => {
            return queryClient.invalidateQueries({queryKey: key});
          });
          Promise.all(invalidations);
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
