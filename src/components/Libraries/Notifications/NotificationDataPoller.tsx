import {useConfig} from '../../Context/Contexts/ConfigContext';
import {useEffect} from 'react';
import {useAuth} from '../../Context/Contexts/AuthContext';
import {useUserNotificationDataQuery} from '../../Queries/Alert/NotificationQueries';
import {useAppState} from '@react-native-community/hooks';
import {useQueryClient} from '@tanstack/react-query';

export const NotificationDataPoller = () => {
  const {isLoggedIn, isLoading} = useAuth();
  const {appConfig, oobeCompleted} = useConfig();
  const enablePolling = oobeCompleted && isLoggedIn && !isLoading && appConfig.enableNotificationPolling;
  const {} = useUserNotificationDataQuery({
    refetchInterval: enablePolling ? appConfig.notificationPollInterval : false,
    enabled: enablePolling,
  });
  const appState = useAppState();
  const queryClient = useQueryClient();

  const logMessage = enablePolling ? 'Polling enabled.' : 'Polling disabled or conditions not met.';
  console.log('[NotificationDataPoller.tsx]', logMessage);

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
