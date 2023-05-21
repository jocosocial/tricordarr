import {startForegroundServiceWorker, stopForegroundServiceWorker} from '../../../libraries/Service';
import {useErrorHandler} from '../../Context/Contexts/ErrorHandlerContext';
import {useUserNotificationData} from '../../Context/Contexts/UserNotificationDataContext';
import {useEffect} from 'react';
import {useAuth} from '../../Context/Contexts/AuthContext';

export const ForegroundService = () => {
  const {setErrorMessage} = useErrorHandler();
  const {enableUserNotifications} = useUserNotificationData();
  const {isLoggedIn} = useAuth();

  useEffect(() => {
    console.log('ForegroundService useEffect called');
    if (isLoggedIn || enableUserNotifications === null) {
      return;
    }
    if (!isLoggedIn && enableUserNotifications) {
      console.log('Starting FGS in ForegroundService');
      startForegroundServiceWorker().catch(error => setErrorMessage(error.toString()));
    } else {
      console.log('Stopping FGS in ForegroundService');
      stopForegroundServiceWorker().catch(error => setErrorMessage(error.toString()));
    }
  }, [isLoggedIn, enableUserNotifications, setErrorMessage]);

  return null;
};
