import {UserHeader} from '#src/Structs/ControllerStructs';
import {useTokenAuthQuery} from '#src/Queries/TokenAuthQuery';

export const useUserBlocksQuery = (options = {}) => {
  return useTokenAuthQuery<UserHeader[]>('/users/blocks', options);
};
