import {startForegroundServiceWorker, stopForegroundServiceWorker} from '../../../libraries/Service';
import {useErrorHandler} from '../../Context/Contexts/ErrorHandlerContext';
import {useUserData} from '../../Context/Contexts/UserDataContext';
import {useUserNotificationData} from '../../Context/Contexts/UserNotificationDataContext';
import {useEffect} from 'react';

export const ForegroundService = () => {
  const {setErrorMessage} = useErrorHandler();
  const {isLoading} = useUserData();
  const {enableUserNotifications} = useUserNotificationData();

  useEffect(() => {
    console.log('ForegroundService useEffect called');
    if (isLoading || enableUserNotifications === null) {
      return;
    }
    if (!isLoading && enableUserNotifications) {
      console.log('Starting FGS in ForegroundService');
      startForegroundServiceWorker().catch(error => setErrorMessage(error.toString()));
    } else {
      console.log('Stopping FGS in ForegroundService');
      stopForegroundServiceWorker().catch(error => setErrorMessage(error.toString()));
    }
  }, [isLoading, enableUserNotifications, setErrorMessage]);

  return null;
};
