import axios, {AxiosError, AxiosResponse} from 'axios';
import {useMutation} from '@tanstack/react-query';
import {ErrorResponse, UserHeader} from '../../../libraries/Structs/ControllerStructs';
import {useTokenAuthQuery} from '../TokenAuthQuery';
import {useErrorHandler} from '../../Context/Contexts/ErrorHandlerContext';

interface UserFavoriteMutationProps {
  userID: string;
  action: 'favorite' | 'unfavorite';
}

const queryHandler = async ({userID, action}: UserFavoriteMutationProps): Promise<AxiosResponse<void>> => {
  return await axios.post(`/users/${userID}/${action}`);
};

export const useUserFavoriteMutation = (retry = 0) => {
  const {setErrorMessage} = useErrorHandler();
  return useMutation<AxiosResponse<void>, AxiosError<ErrorResponse>, UserFavoriteMutationProps>(queryHandler, {
    retry: retry,
    onError: error => {
      setErrorMessage(error.response?.data.reason || error.message);
    },
  });
};

export const useUserFavoritesQuery = () => {
  return useTokenAuthQuery<UserHeader[]>({
    queryKey: ['/users/favorites'],
  });
};
