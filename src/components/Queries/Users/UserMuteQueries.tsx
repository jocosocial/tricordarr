import axios, {AxiosError, AxiosResponse} from 'axios';
import {useMutation, useQuery} from '@tanstack/react-query';
import {ErrorResponse, UserHeader} from '../../../libraries/Structs/ControllerStructs';

interface UserMuteMutationProps {
  userID: string;
  action: 'mute' | 'unmute';
}

const queryHandler = async ({userID, action}: UserMuteMutationProps): Promise<AxiosResponse<void>> => {
  return await axios.post(`/users/${userID}/${action}`);
};

export const useUserMuteMutation = (retry = 0) => {
  return useMutation<AxiosResponse<void>, AxiosError<ErrorResponse>, UserMuteMutationProps>(queryHandler, {
    retry: retry,
  });
};

export const useUserMutesQuery = () => {
  return useQuery<UserHeader[]>({
    queryKey: ['/users/mutes'],
  });
};
