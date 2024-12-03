import {UserHeader} from '../../../libraries/Structs/ControllerStructs';
import {useTokenAuthQuery} from '../TokenAuthQuery';

export const useUserFavoritesQuery = (options = {}) => {
  return useTokenAuthQuery<UserHeader[]>('/users/favorites', options);
};
