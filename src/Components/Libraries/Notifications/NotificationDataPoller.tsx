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
    // True honors staleTime, which for this query defaults to 30 seconds.
    // 'always' will refetch even if within the staleTime. I'm electing to do true
    // here because 30 seconds should be sufficient and I don't want to over-fetch.
    // This used to be done in a useEffect. Overkill...
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  return null;
};
