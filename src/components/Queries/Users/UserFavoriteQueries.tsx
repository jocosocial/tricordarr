import axios, {AxiosError, AxiosResponse} from 'axios';
import {useMutation, useQuery} from '@tanstack/react-query';
import {ErrorResponse, UserHeader} from '../../../libraries/Structs/ControllerStructs';

interface UserFavoriteMutationProps {
  userID: string;
  action: 'favorite' | 'unfavorite';
}

const queryHandler = async ({userID, action}: UserFavoriteMutationProps): Promise<AxiosResponse<void>> => {
  return await axios.post(`/users/${userID}/${action}`);
};

export const useUserFavoriteMutation = (retry = 0) => {
  return useMutation<AxiosResponse<void>, AxiosError<ErrorResponse>, UserFavoriteMutationProps>(queryHandler, {
    retry: retry,
  });
};

export const useUserFavoritesQuery = () => {
  return useQuery<UserHeader[]>({
    queryKey: ['/users/favorites'],
  });
};
