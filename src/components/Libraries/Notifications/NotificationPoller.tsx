import React, {useState} from 'react';
import {useAppState} from '../../Context/Contexts/AppStateContext';
import {useErrorHandler} from '../../Context/Contexts/ErrorHandlerContext';
import {AppSettings} from '../../../libraries/AppSettings';

interface NotificationPollerProps {
  isLoading: boolean;
  enable: boolean;
  isLoggedIn: boolean;
}

export const NotificationPoller = ({isLoading, enable, isLoggedIn}: NotificationPollerProps) => {
  const [pollIntervalID, setPollIntervalID] = useState(0);
  const {appStateVisible} = useAppState();
  const {setErrorMessage} = useErrorHandler();

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
      console.log('POLLING!');
    }, pollInterval);
    setPollIntervalID(id);
  }

  if (appStateVisible !== 'active' || !enable || !isLoggedIn) {
    cleanupNotificationPoller();
    console.log('NotificationPoller has shut down');
  } else if (!isLoading && isLoggedIn && enable && appStateVisible === 'active') {
    if (pollIntervalID === 0) {
      startNotificationPoller()
        .catch(error => setErrorMessage(error.toString()))
        .finally(() => console.log('initial'));
    } else {
      console.log('A running interval already exists with id', pollIntervalID);
    }
    console.log('NotificationPoller was running or has started.');
  }

  return <></>;
};
