import {UserNotificationData} from '../../../libraries/Structs/ControllerStructs';
import {useTokenAuthQuery} from '../TokenAuthQuery';

export const useUserNotificationDataQuery = () => {
  return useTokenAuthQuery<UserNotificationData>({
    queryKey: ['/notification/global'],
  });
};
