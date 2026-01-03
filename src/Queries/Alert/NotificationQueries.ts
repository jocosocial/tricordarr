import {useConfig} from '#src/Context/Contexts/ConfigContext';
import {STALE} from '#src/Libraries/Time/Time';
import {TokenAuthQueryOptionsType, useTokenAuthQuery} from '#src/Queries/TokenAuthQuery';
import {UserNotificationData} from '#src/Structs/ControllerStructs';

/**
 * Retrieve info on the number of each type of notification supported by Swiftarr.
 * Login not required, but may respond differently if logged in.
 */
export const useUserNotificationDataQuery = (options: TokenAuthQueryOptionsType<UserNotificationData> = {}) => {
  const {appConfig} = useConfig();
  return useTokenAuthQuery<UserNotificationData>('/notification/global', {
    staleTime: STALE.SECONDS.THIRTY,
    enabled: !appConfig.preRegistrationMode,
    ...options,
  });
};
