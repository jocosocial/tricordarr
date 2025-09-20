import {useEffect} from 'react';

import {useAuth} from '#src/Context/Contexts/AuthContext';
import {useUserNotificationData} from '#src/Context/Contexts/UserNotificationDataContext';
import {startForegroundServiceWorker, stopForegroundServiceWorker} from '#src/Libraries/Service';

/**
 * Functional component to control the actions of the Foreground Service Worker, the background
 * process that generates push notifications.
 */
export const ForegroundService = () => {
  const {enableUserNotifications} = useUserNotificationData();
  const {isLoggedIn, isLoading} = useAuth();

  useEffect(() => {
    if (isLoading || enableUserNotifications === null) {
      console.log('[ForegroundService.tsx] Conditions for foreground service not met. Not starting FGS.');
      return;
    }

    console.log(`[ForegroundService.tsx] isLoggedIn ${isLoggedIn}, enableUserNotifications ${enableUserNotifications}`);
    if (isLoggedIn && enableUserNotifications) {
      startForegroundServiceWorker();
    } else {
      stopForegroundServiceWorker();
    }
  }, [enableUserNotifications, isLoading, isLoggedIn]);

  return null;
};
