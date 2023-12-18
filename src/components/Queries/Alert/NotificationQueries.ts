import {UserNotificationData} from '../../../libraries/Structs/ControllerStructs';
import {useTokenAuthQuery} from '../TokenAuthQuery';

/**
 * Retrieve info on the number of each type of notification supported by Swiftarr.
 * Login not required, but may respond differently if logged in.
 */
export const useUserNotificationDataQuery = (options = {}) => {
  return useTokenAuthQuery<UserNotificationData>({
    queryKey: ['/notification/global'],
    // staleTime: 1000 * 10,
    cacheTime: 0,
    staleTime: 0,
    keepPreviousData: false,
    ...options,
  });
};
