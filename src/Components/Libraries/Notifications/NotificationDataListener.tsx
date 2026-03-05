import {useAppState} from '@react-native-community/hooks';
import {useCallback, useEffect} from 'react';

import {useCall} from '#src/Context/Contexts/CallContext';
import {useEnableUserNotification} from '#src/Context/Contexts/EnableUserNotificationContext';
import {useOobe} from '#src/Context/Contexts/OobeContext';
import {usePreRegistration} from '#src/Context/Contexts/PreRegistrationContext';
import {useSession} from '#src/Context/Contexts/SessionContext';
import {useSocket} from '#src/Context/Contexts/SocketContext';
import {useFezCacheReducer} from '#src/Hooks/Fez/useFezCacheReducer';
import {createLogger} from '#src/Libraries/Logger';
import {navigate as navigationNavigate} from '#src/Libraries/NavigationRef';
import {generatePushNotificationFromEvent} from '#src/Libraries/Notifications/SocketNotification';
import {isEmulator, isIOS} from '#src/Libraries/Platform/Detection';
import {ChatStackScreenComponents} from '#src/Navigation/Stacks/ChatStackNavigator';
import {BottomTabComponents} from '#src/Navigation/Tabs/BottomTabNavigator';
import {useAnnouncementsQuery} from '#src/Queries/Alert/AnnouncementQueries';
import {useUserNotificationDataQuery} from '#src/Queries/Alert/NotificationQueries';
import {NotificationTypeData, SocketNotificationData} from '#src/Structs/SocketStructs';

const logger = createLogger('NotificationDataListener.tsx');

/**
 * Functional component to respond to Notification Socket events from Swiftarr.
 * This is only responsible for any responses that should be processed within the React UI.
 * This is NOT responsible for push notifications.
 */
export const NotificationDataListener = () => {
  const {enableUserNotifications} = useEnableUserNotification();
  const {isLoggedIn} = useSession();
  const {oobeCompleted} = useOobe();
  const {preRegistrationMode} = usePreRegistration();
  const {refetch: refetchUserNotificationData} = useUserNotificationDataQuery({
    enabled: oobeCompleted && isLoggedIn && !preRegistrationMode,
  });
  const appStateVisible = useAppState();
  const {notificationSocket} = useSocket();
  const {refetch: refetchAnnouncements} = useAnnouncementsQuery({enabled: false});
  const {receiveCall, endCall} = useCall();
  const {invalidateFez} = useFezCacheReducer();

  const wsMessageHandler = useCallback(
    (event: WebSocketMessageEvent) => {
      logger.debug('wsMessageHandler received data from server:', event.data);
      const notificationData = JSON.parse(event.data) as SocketNotificationData;
      const notificationType = SocketNotificationData.getType(notificationData);
      console.log(`[NotificationDataListener.tsx] Notification type: ${notificationType}`);
      // Always refetch the UserNotificationData when we got a socket event.
      refetchUserNotificationData();

      // Some kinds of socket events should update other areas of the state.
      switch (notificationType) {
        case NotificationTypeData.phoneCallEnded: {
          // Initiator receives this when receiver declines or call ends - sync local call state
          endCall();
          break;
        }
        case NotificationTypeData.announcement: {
          refetchAnnouncements();
          break;
        }
        case NotificationTypeData.incomingPhoneCall: {
          // For incoming phone calls:
          // - On iOS: Use CallKit for native incoming call UI
          // - On Android: Generate push notification
          console.log('[NotificationDataListener.tsx] Incoming phone call notification');

          if (isIOS) {
            const caller = notificationData.caller;
            if (caller) {
              isEmulator().then(isSim => {
                if (isSim) {
                  navigationNavigate(BottomTabComponents.seamailTab, {
                    screen: ChatStackScreenComponents.krakenTalkReceiveScreen,
                    params: {
                      callID: notificationData.contentID,
                      callerUserID: String(caller.userID),
                      callerUsername: caller.username,
                    },
                  });
                  receiveCall(
                    notificationData.contentID,
                    {userID: caller.userID, username: caller.username},
                    {
                      useCallKit: false,
                    },
                  );
                } else {
                  receiveCall(notificationData.contentID, {userID: caller.userID, username: caller.username});
                }
              });
            } else {
              console.warn('[NotificationDataListener.tsx] No caller info in phone call notification');
            }
          } else {
            // On Android, use push notification
            console.log('[NotificationDataListener.tsx] Generating push notification for incoming call');
            generatePushNotificationFromEvent(event).catch(error => {
              console.error(
                '[NotificationDataListener.tsx] Failed to generate push notification for incoming call:',
                error,
              );
            });
          }
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
          invalidateFez(notificationData.contentID);
          break;
        }
      }
    },
    [invalidateFez, refetchAnnouncements, refetchUserNotificationData, receiveCall, endCall],
  );

  const addHandler = useCallback(() => {
    logger.debug('Adding handler.');
    notificationSocket?.addEventListener('message', wsMessageHandler);
  }, [notificationSocket, wsMessageHandler]);

  const removeHandler = useCallback(() => {
    logger.debug('Removing handler.');
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
    logger.debug('useEffect state is', enableUserNotifications, appStateVisible, isLoggedIn);
    return () => removeHandler();
  }, [addHandler, appStateVisible, enableUserNotifications, removeHandler, isLoggedIn]);

  return null;
};
