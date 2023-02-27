import React, {useCallback, useEffect, useState} from 'react';
import {useAppState} from '../../Context/Contexts/AppStateContext';
import {AppState} from 'react-native';
import {useErrorHandler} from "../../Context/Contexts/ErrorHandlerContext";

interface NotificationPollerProps {
  isLoading: boolean;
  isVisible: string;
}

export const NotificationPoller = ({isLoading, enable}: NotificationPollerProps) => {
  console.log('Welcome to the NotificationPoller!');
  console.log('Loading', isLoading);
  console.log('Enable', enable);

  const [pollIntervalID, setPollIntervalID] = useState(0);
  const {appStateVisible} = useAppState();
  const {setErrorMessage} = useErrorHandler();

  const cleanupNotificationPoller = useCallback(async () => {
    // For some reason this is reversed when inside the useEffect. I have no idea why
    // and will deal with it later. The state should be 'background' or something.
    console.log('Cleaning up');
    if (appStateVisible === 'active') {
      clearInterval(pollIntervalID);
      setPollIntervalID(0);
      console.log('Cleared setInterval with ID', pollIntervalID);
    }
  }, [appStateVisible, pollIntervalID]);

  if (!isLoading && enable && appStateVisible === 'active') {
    console.log('The poller should be started');
  }
  console.log('Current poll ID is', pollIntervalID);
  // } else {
  //   console.log('The poller must be killed');
  //   clearInterval(pollIntervalID);
  //   setPollIntervalID(0);
  //   // cleanupNotificationPoller().catch(error => setErrorMessage(error.toString()));
  // }

  console.log('NotificationPoller app state is', appStateVisible);

  useEffect(() => {
    return () => {
      cleanupNotificationPoller().catch(error => {
        console.error('NotificationPoller cleanup failed', error);
      });
    };
  }, [cleanupNotificationPoller, appStateVisible]);

  return <></>;
};
