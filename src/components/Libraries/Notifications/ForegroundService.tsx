import {startForegroundServiceWorker, stopForegroundServiceWorker} from '../../../Libraries/Service';
import {useUserNotificationData} from '../../Context/Contexts/UserNotificationDataContext';
import {useEffect} from 'react';
import {useAuth} from '../../Context/Contexts/AuthContext';

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
