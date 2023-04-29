import axios, {AxiosError, AxiosResponse} from 'axios';
import {useMutation, useQuery} from '@tanstack/react-query';
import {ErrorResponse, UserHeader} from '../../../libraries/Structs/ControllerStructs';

interface UserBlockMutationProps {
  userID: string;
  action: 'block' | 'unblock';
}

const queryHandler = async ({userID, action}: UserBlockMutationProps): Promise<AxiosResponse<void>> => {
  return await axios.post(`/users/${userID}/${action}`);
};

export const useUserBlockMutation = (retry = 0) => {
  return useMutation<AxiosResponse<void>, AxiosError<ErrorResponse>, UserBlockMutationProps>(queryHandler, {
    retry: retry,
  });
};

export const useUserBlocksQuery = () => {
  return useQuery<UserHeader[]>({
    queryKey: ['/users/blocks'],
  });
};
