import {useTokenAuthQuery} from '#src/Queries/TokenAuthQuery';
import {UserHeader} from '#src/Structs/ControllerStructs';

export const useUserBlocksQuery = (options = {}) => {
  return useTokenAuthQuery<UserHeader[]>('/users/blocks', options);
};
