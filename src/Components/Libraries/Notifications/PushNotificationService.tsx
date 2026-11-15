import {useEffect} from 'react';

import {useConfig} from '#src/Context/Contexts/ConfigContext';
import {useEnableUserNotification} from '#src/Context/Contexts/EnableUserNotificationContext';
import {useSession} from '#src/Context/Contexts/SessionContext';
import {createLogger} from '#src/Libraries/Logger';
import {startPushProvider, stopPushProvider} from '#src/Libraries/Notifications/Push';
import {syncAndroidPushAccounts} from '#src/Libraries/Notifications/Push/Android/PushService';
import {isAndroid} from '#src/Libraries/Platform/Detection';

const logger = createLogger('PushNotificationService.tsx');

/**
 * Functional component to control the lifecycle of the platform-dependent push notification
 * system.
 *
 * iOS uses a combination of a background `NEAppPushManager` and a websocket listener to generate
 * notifications purely on the native side.
 *
 * Android uses a native Kotlin foreground service (TwitarrPushService) that owns the socket and
 * posts notifications itself. JS only tells it which accounts to serve: it syncs the account list,
 * including the push preferences, whenever they change.
 */
export const PushNotificationService = () => {
  const {enableUserNotifications} = useEnableUserNotification();
  const {isLoading, isLoggedIn, currentSession} = useSession();
  const {appConfig} = useConfig();

  useEffect(() => {
    logger.debug('isLoggedIn', isLoggedIn, 'enableUserNotifications', enableUserNotifications);
    if (isLoading || enableUserNotifications === null) {
      logger.debug('Conditions for push notifications not met. Not starting.');
      return;
    }

    // enableUserNotifications already factors in oobeCompleted, isLoggedIn, and preRegistrationMode.
    if (enableUserNotifications) {
      startPushProvider();
    } else {
      stopPushProvider();
    }
  }, [enableUserNotifications, isLoggedIn, isLoading]);

  // The native service filters with its own copy of the preferences, so push changes to it.
  useEffect(() => {
    if (!isAndroid || !enableUserNotifications) {
      return;
    }
    syncAndroidPushAccounts().catch(error => logger.error('Failed to sync push accounts', error));
  }, [
    enableUserNotifications,
    currentSession?.sessionID,
    currentSession?.tokenData?.token,
    appConfig.pushNotifications,
    appConfig.muteNotifications,
    appConfig.urlPrefix,
    appConfig.enableNotificationSocket,
  ]);

  return null;
};
