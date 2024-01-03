import axios, {AxiosResponse} from 'axios';
import {UserHeader} from '../../../libraries/Structs/ControllerStructs';
import {useTokenAuthQuery} from '../TokenAuthQuery';
import {useTokenAuthMutation} from '../TokenAuthMutation';

interface UserFavoriteMutationProps {
  userID: string;
  action: 'favorite' | 'unfavorite';
}

const queryHandler = async ({userID, action}: UserFavoriteMutationProps): Promise<AxiosResponse<void>> => {
  return await axios.post(`/users/${userID}/${action}`);
};

export const useUserFavoriteMutation = () => {
  return useTokenAuthMutation(queryHandler);
};

export const useUserFavoritesQuery = (options = {}) => {
  return useTokenAuthQuery<UserHeader[]>({
    queryKey: ['/users/favorites'],
    ...options,
  });
};
