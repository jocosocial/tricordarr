import {UserHeader} from '../../../Libraries/Structs/ControllerStructs';
import {useTokenAuthQuery} from '../TokenAuthQuery';

export const useUserMutesQuery = (options = {}) => {
  return useTokenAuthQuery<UserHeader[]>('/users/mutes', options);
};
