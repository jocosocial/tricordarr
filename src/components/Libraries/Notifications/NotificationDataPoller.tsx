import {useConfig} from '../../Context/Contexts/ConfigContext';
import {useCallback, useEffect, useState} from 'react';
import {useAuth} from '../../Context/Contexts/AuthContext';
import {useUserNotificationDataQuery} from '../../Queries/Alert/NotificationQueries';
import {useAppState} from '@react-native-community/hooks';
import {useQueryClient} from '@tanstack/react-query';

export const NotificationDataPoller = () => {
  const {isLoggedIn, isLoading} = useAuth();
  const {refetch: refetchUserNotificationData} = useUserNotificationDataQuery();
  const {appConfig} = useConfig();
  const [intervalId, setIntervalId] = useState<NodeJS.Timer>();
  const appState = useAppState();
  const queryClient = useQueryClient();

  const clearPollInterval = (id?: NodeJS.Timer) => {
    if (id === undefined) {
      console.log('[NotificationDataPoller.tsx] No interval ID, not clearing');
      return;
    }
    console.log('[NotificationDataPoller.tsx] Clearing poll interval with ID', id);
    clearInterval(id);
    setIntervalId(undefined);
  };

  const startPollInterval = useCallback(() => {
    const newId = setInterval(() => {
      console.log('[NotificationDataPoller.tsx] Polling user notification data.');
      refetchUserNotificationData();
    }, appConfig.notificationPollInterval);
    console.log('[NotificationDataPoller.tsx] Started poll interval with ID', newId);
    setIntervalId(newId);
    return newId;
  }, [appConfig.notificationPollInterval, refetchUserNotificationData]);

  useEffect(() => {
    if (isLoggedIn && !isLoading && appConfig.enableNotificationPolling) {
      console.log('[NotificationDataPoller.tsx] Conditions for polling are met!');
      if (intervalId === undefined) {
        startPollInterval();
      } else {
        console.log('[NotificationDataPoller.tsx] Poll interval already exists. Skipping.');
      }
    } else {
      console.log('[NotificationDataPoller.tsx] Conditions for polling are not met.');
    }
    return () => clearPollInterval(intervalId);
  }, [
    appConfig.enableNotificationPolling,
    appConfig.notificationPollInterval,
    intervalId,
    isLoading,
    isLoggedIn,
    refetchUserNotificationData,
    startPollInterval,
  ]);

  // When the app loads (either from nothing or from background) trigger a refresh of the notification
  // data endpoint.
  useEffect(() => {
    if (appState === 'active') {
      console.log('[NotificationDataPoller.tsx] Refreshing notification data');
      queryClient.invalidateQueries(['/notification/global']);
    }
  }, [appState, refetchUserNotificationData]);

  return null;
};
