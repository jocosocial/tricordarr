import {useAppState} from '@react-native-community/hooks';
import {useQueryClient} from '@tanstack/react-query';
import {useEffect} from 'react';

import {useAuth} from '#src/Context/Contexts/AuthContext';
import {useConfig} from '#src/Context/Contexts/ConfigContext';
import {useUserNotificationDataQuery} from '#src/Queries/Alert/NotificationQueries';

export const NotificationDataPoller = () => {
  const {isLoggedIn, isLoading} = useAuth();
  const {appConfig, oobeCompleted} = useConfig();
  const enablePolling = oobeCompleted && isLoggedIn && !isLoading && appConfig.enableNotificationPolling;
  const {data} = useUserNotificationDataQuery({
    refetchInterval: enablePolling ? appConfig.notificationPollInterval : false,
    enabled: enablePolling,
  });
  const appState = useAppState();
  const queryClient = useQueryClient();

  if (!enablePolling) {
    console.log('[NotificationDataPoller.tsx] Polling disabled or conditions not met.');
  } else {
    console.log(`[NotificationDataPoller.tsx] Polling enabled, response serverTime is ${data?.serverTime}`);
  }

  // When the app loads (either from nothing or from background) trigger a refresh of the notification
  // data endpoint.
  useEffect(() => {
    if (appState === 'active') {
      console.log('[NotificationDataPoller.tsx] Refreshing notification data');
      queryClient.invalidateQueries(['/notification/global']);
    }
  }, [appState, queryClient]);

  return null;
};
