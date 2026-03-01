import {useTokenAuthQuery} from '#src/Queries/TokenAuthQuery';
import {USER_RELATION_ENDPOINTS} from '#src/Queries/Users/UserRelationConstants';
import {UserHeader} from '#src/Structs/ControllerStructs';

export const useUserBlocksQuery = (options = {}) => {
  return useTokenAuthQuery<UserHeader[]>(USER_RELATION_ENDPOINTS.block, options);
};
