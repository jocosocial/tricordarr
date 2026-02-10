import {useEffect} from 'react';

import {useEnableUserNotification} from '#src/Context/Contexts/EnableUserNotificationContext';
import {useSession} from '#src/Context/Contexts/SessionContext';
import {createLogger} from '#src/Libraries/Logger';
import {startPushProvider, stopPushProvider} from '#src/Libraries/Notifications/Push';

const logger = createLogger('PushNotificationService.tsx');

/**
 * Functional component to control the lifecycle of the platform-dependent push notification
 * system.
 *
 * iOS uses a combination of a background `NEAppPushManager` and a websocket listener to generate
 * notifications purely on the native side.
 *
 * Android uses a Foreground Service worker, which runs in the background (ironic naming, right?)
 * and generates notifications on the JS side.
 */
export const PushNotificationService = () => {
  const {enableUserNotifications} = useEnableUserNotification();
  const {isLoading, isLoggedIn} = useSession();

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

  return null;
};
