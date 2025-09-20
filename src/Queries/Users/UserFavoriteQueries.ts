import {UserHeader} from '#src/Structs/ControllerStructs';
import {useTokenAuthQuery} from '#src/Queries/TokenAuthQuery';

export const useUserFavoritesQuery = (options = {}) => {
  return useTokenAuthQuery<UserHeader[]>('/users/favorites', options);
};
