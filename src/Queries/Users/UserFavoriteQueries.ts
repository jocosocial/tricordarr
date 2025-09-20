import {UserHeader} from '../../../Libraries/Structs/ControllerStructs';
import {useTokenAuthQuery} from '../TokenAuthQuery';

export const useUserFavoritesQuery = (options = {}) => {
  return useTokenAuthQuery<UserHeader[]>('/users/favorites', options);
};
