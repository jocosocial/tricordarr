import {useAuth} from '#src/Context/Contexts/AuthContext';
import {useConfig} from '#src/Context/Contexts/ConfigContext';
import {useUserNotificationDataQuery} from '#src/Queries/Alert/NotificationQueries';

/**
 * Functional component to poll the notification data endpoint. All of the actual polling
 * magic is done through React Query.
 */
export const NotificationDataPoller = () => {
  const {isLoggedIn, isLoading} = useAuth();
  const {appConfig, oobeCompleted} = useConfig();
  const enablePolling =
    oobeCompleted && isLoggedIn && !isLoading && !appConfig.preRegistrationMode && appConfig.enableNotificationPolling;

  useUserNotificationDataQuery({
    refetchInterval: enablePolling ? appConfig.notificationPollInterval : false,
    enabled: enablePolling,
    // true honors staleTime, which for this query defaults to 30 seconds.
    // 'always' will refetch even if within the staleTime.
    // This used to be done in a useEffect. Very overkill...
    refetchOnMount: true,
    refetchOnWindowFocus: 'always',
  });

  return null;
};
