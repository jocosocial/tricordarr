import {useEffect} from 'react';

import {useAuth} from '#src/Context/Contexts/AuthContext';
import {useConfig} from '#src/Context/Contexts/ConfigContext';
import {useEnableUserNotification} from '#src/Context/Contexts/EnableUserNotificationContext';
import {startPushProvider, stopPushProvider} from '#src/Libraries/Notifications/Push';

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
  const {isLoggedIn, isLoading} = useAuth();
  const {oobeCompleted} = useConfig();

  useEffect(() => {
    console.log(
      `[PushNotificationService.tsx] isLoggedIn ${isLoggedIn}, enableUserNotifications ${enableUserNotifications}`,
    );
    if (isLoading || enableUserNotifications === null) {
      console.log('[PushNotificationService.tsx] Conditions for push notifications not met. Not starting.');
      return;
    }

    if (isLoggedIn && enableUserNotifications && oobeCompleted) {
      startPushProvider();
    } else {
      stopPushProvider();
    }
  }, [enableUserNotifications, isLoading, isLoggedIn, oobeCompleted]);

  return null;
};
