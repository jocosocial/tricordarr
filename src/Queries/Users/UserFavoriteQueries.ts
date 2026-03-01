import {STALE} from '#src/Libraries/Time/Time';
import {useTokenAuthQuery} from '#src/Queries/TokenAuthQuery';
import {UserHeader} from '#src/Structs/ControllerStructs';

export const useUserFavoritesQuery = (options = {}) => {
  return useTokenAuthQuery<UserHeader[]>('/users/favorites', {
    staleTime: STALE.HOURS.ONE,
    ...options,
  });
};
