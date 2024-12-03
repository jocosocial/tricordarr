import {UserHeader} from '../../../libraries/Structs/ControllerStructs';
import {useTokenAuthQuery} from '../TokenAuthQuery';

export const useUserMutesQuery = (options = {}) => {
  return useTokenAuthQuery<UserHeader[]>('/users/mutes', options);
};
