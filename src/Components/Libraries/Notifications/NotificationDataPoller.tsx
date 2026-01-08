import {useConfig} from '#src/Context/Contexts/ConfigContext';
import {useOobe} from '#src/Context/Contexts/OobeContext';
import {usePreRegistration} from '#src/Context/Contexts/PreRegistrationContext';
import {useSession} from '#src/Context/Contexts/SessionContext';
import {useUserNotificationDataQuery} from '#src/Queries/Alert/NotificationQueries';

/**
 * Functional component to poll the notification data endpoint. All of the actual polling
 * magic is done through React Query.
 */
export const NotificationDataPoller = () => {
  const {isLoggedIn, isLoading} = useSession();
  const {appConfig} = useConfig();
  const {oobeCompleted} = useOobe();
  const {preRegistrationMode} = usePreRegistration();
  const enablePolling =
    oobeCompleted && isLoggedIn && !isLoading && !preRegistrationMode && appConfig.enableNotificationPolling;

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
