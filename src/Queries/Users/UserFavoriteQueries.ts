import {STALE} from '#src/Libraries/Time/Time';
import {useTokenAuthQuery} from '#src/Queries/TokenAuthQuery';
import {USER_RELATION_ENDPOINTS} from '#src/Queries/Users/UserRelationConstants';
import {UserHeader} from '#src/Structs/ControllerStructs';

export const useUserFavoritesQuery = (options = {}) => {
  return useTokenAuthQuery<UserHeader[]>(USER_RELATION_ENDPOINTS.favorite, {
    staleTime: STALE.HOURS.ONE,
    ...options,
  });
};
