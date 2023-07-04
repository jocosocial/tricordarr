import {startForegroundServiceWorker, stopForegroundServiceWorker} from '../../../libraries/Service';
import {useUserNotificationData} from '../../Context/Contexts/UserNotificationDataContext';
import {useEffect} from 'react';
import {useAuth} from '../../Context/Contexts/AuthContext';

export const ForegroundService = () => {
  const {enableUserNotifications} = useUserNotificationData();
  const {isLoggedIn, isLoading} = useAuth();

  useEffect(() => {
    if (isLoading || enableUserNotifications === null) {
      console.log(`[ForegroundService.tsx] Conditions for foreground service not met. Not starting FGS.`);
      return;
    }
    // if (!isLoggedIn || !enableUserNotifications) {
    //   console.log(`[FGS] user not logged in ${isLoggedIn} or notifications disabled ${enableUserNotifications}`);
    //   stopFgsWorker();
    //   return;
    // }

    console.log(`[ForegroundService.tsx] isLoggedIn ${isLoggedIn}, enableUserNotifications ${enableUserNotifications}`);
    if (isLoggedIn && enableUserNotifications) {
      startForegroundServiceWorker();
    } else {
      stopForegroundServiceWorker();
    }
  }, [enableUserNotifications, isLoading, isLoggedIn]);

  return null;
};
