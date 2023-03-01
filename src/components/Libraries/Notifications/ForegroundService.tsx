import {startForegroundServiceWorker, stopForegroundServiceWorker} from '../../../libraries/Service';
import {useErrorHandler} from '../../Context/Contexts/ErrorHandlerContext';
import {useUserData} from '../../Context/Contexts/UserDataContext';
import {useUserNotificationData} from '../../Context/Contexts/UserNotificationDataContext';

export const ForegroundService = () => {
  const {setErrorMessage} = useErrorHandler();
  const {isLoading} = useUserData();
  const {enableUserNotifications} = useUserNotificationData();

  if (isLoading || enableUserNotifications === null) {
    return null;
  }

  if (!isLoading && enableUserNotifications) {
    console.log('Starting FGS');
    startForegroundServiceWorker().catch(error => setErrorMessage(error.toString()));
  } else {
    console.log('Stopping FGS');
    stopForegroundServiceWorker().catch(error => setErrorMessage(error.toString()));
  }

  return null;
};
