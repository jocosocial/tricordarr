import {UserHeader} from '../../../Libraries/Structs/ControllerStructs';
import {useTokenAuthQuery} from '../TokenAuthQuery';

export const useUserBlocksQuery = (options = {}) => {
  return useTokenAuthQuery<UserHeader[]>('/users/blocks', options);
};
