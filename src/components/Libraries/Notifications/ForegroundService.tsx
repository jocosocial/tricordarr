import {startForegroundServiceWorker, stopForegroundServiceWorker} from '../../../libraries/Service';
import {useUserNotificationData} from '../../Context/Contexts/UserNotificationDataContext';
import {useEffect} from 'react';
import {useAuth} from '../../Context/Contexts/AuthContext';

export const ForegroundService = () => {
  const {enableUserNotifications} = useUserNotificationData();
  const {isLoggedIn, isLoading} = useAuth();

  const startFgsWorker = () => {
    console.log('[FGS] start in ForegroundService.tsx');
    startForegroundServiceWorker();
  };
  const stopFgsWorker = () => {
    console.log('[FGS] stop in ForegroundService.tsx');
    stopForegroundServiceWorker();
  };

  useEffect(() => {
    console.log('[FGS] useEffect in ForegroundService.tsx');
    if (isLoading || enableUserNotifications === null) {
      console.log(`[FGS] isLoading ${isLoading} enableUserNotifications ${enableUserNotifications}`);
      return;
    }
    // if (!isLoggedIn || !enableUserNotifications) {
    //   console.log(`[FGS] user not logged in ${isLoggedIn} or notifications disabled ${enableUserNotifications}`);
    //   stopFgsWorker();
    //   return;
    // }

    console.log(`[FGS] isLoggedIn ${isLoggedIn}, enableUserNotifications ${enableUserNotifications}`);
    if (isLoggedIn && enableUserNotifications) {
      startFgsWorker();
    } else {
      stopFgsWorker();
    }
  }, [enableUserNotifications, isLoading, isLoggedIn]);

  return null;
};
