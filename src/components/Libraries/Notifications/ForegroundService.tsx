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
    if (isLoading) {
      return;
    }
    if (!isLoggedIn || !enableUserNotifications) {
      console.log('[FGS] user not logged in or notifications disabled');
      stopFgsWorker();
      return;
    }

    if (isLoggedIn && enableUserNotifications) {
      startFgsWorker();
    } else {
      stopFgsWorker();
    }
  }, [enableUserNotifications, isLoading, isLoggedIn]);

  // useEffect(() => {
  //   console.log('ForegroundService useEffect called');
  //   if (isLoggedIn || enableUserNotifications === null) {
  //     return;
  //   }
  //   if (!isLoggedIn && enableUserNotifications) {
  //     console.log('Starting FGS in ForegroundService');
  //     startForegroundServiceWorker().catch(error => setErrorMessage(error.toString()));
  //   } else {
  //     console.log('Stopping FGS in ForegroundService');
  //     stopForegroundServiceWorker().catch(error => setErrorMessage(error.toString()));
  //   }
  // }, [isLoggedIn, enableUserNotifications, setErrorMessage]);

  return null;
};
