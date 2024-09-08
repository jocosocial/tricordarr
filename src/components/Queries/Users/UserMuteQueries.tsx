import axios, {AxiosResponse} from 'axios';
import {UserHeader} from '../../../libraries/Structs/ControllerStructs';
import {useTokenAuthQuery} from '../TokenAuthQuery';
import {useTokenAuthMutation} from '../TokenAuthMutation';

interface UserMuteMutationProps {
  userID: string;
  action: 'mute' | 'unmute';
}

const queryHandler = async ({userID, action}: UserMuteMutationProps): Promise<AxiosResponse<void>> => {
  return await axios.post(`/users/${userID}/${action}`);
};

export const useUserMuteMutation = () => {
  return useTokenAuthMutation(queryHandler);
};

export const useUserMutesQuery = (options = {}) => {
  return useTokenAuthQuery<UserHeader[]>('/users/mutes', options);
};
