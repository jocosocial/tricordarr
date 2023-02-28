import {useEffect, useState} from 'react';
import {useAppState} from '../../Context/Contexts/AppStateContext';
import {useErrorHandler} from '../../Context/Contexts/ErrorHandlerContext';
import {AppSettings} from '../../../libraries/AppSettings';
import {useQuery} from '@tanstack/react-query';
import {UserNotificationData} from '../../../libraries/Structs/ControllerStructs';
import {useUserNotificationData} from '../../Context/Contexts/UserNotificationDataContext';
import {useUserData} from '../../Context/Contexts/UserDataContext';

export const NotificationDataPoller = () => {
  const [pollIntervalID, setPollIntervalID] = useState(0);
  const {appStateVisible} = useAppState();
  const {setErrorMessage} = useErrorHandler();
  const {setUserNotificationData, enableUserNotifications} = useUserNotificationData();
  const {isLoading} = useUserData();

  const {data, refetch} = useQuery<UserNotificationData>({
    queryKey: ['/notification/global'],
    enabled: !!enableUserNotifications,
  });

  useEffect(() => {
    if (data) {
      setUserNotificationData(data);
    }
  }, [data, setUserNotificationData]);

  function cleanupNotificationPoller() {
    if (pollIntervalID !== 0) {
      setPollIntervalID(0);
      clearInterval(pollIntervalID);
      console.log('Cleared setInterval with ID', pollIntervalID);
    }
  }

  async function startNotificationPoller() {
    let pollInterval: number = Number((await AppSettings.NOTIFICATION_POLL_INTERVAL.getValue()) ?? '5000');
    const id = setInterval(() => {
      refetch();
    }, pollInterval);
    setPollIntervalID(id);
    console.log('Started NotificationPoller with ID', id);
  }

  if (appStateVisible !== 'active' || !enableUserNotifications) {
    cleanupNotificationPoller();
  } else if (!isLoading && enableUserNotifications && appStateVisible === 'active') {
    if (pollIntervalID === 0) {
      startNotificationPoller()
        .then(() => refetch())
        .catch(error => setErrorMessage(error.toString()));
    } else {
      // console.log('A running interval already exists with id', pollIntervalID);
    }
    // console.log('NotificationPoller was running or has started.');
  }

  return null;
};
