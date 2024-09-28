import axios, {AxiosResponse} from 'axios';
import {UserHeader} from '../../../libraries/Structs/ControllerStructs';
import {useTokenAuthQuery} from '../TokenAuthQuery';
import {useTokenAuthMutation} from '../TokenAuthMutation';

interface UserBlockMutationProps {
  userID: string;
  action: 'block' | 'unblock';
}

const queryHandler = async ({userID, action}: UserBlockMutationProps): Promise<AxiosResponse<void>> => {
  return await axios.post(`/users/${userID}/${action}`);
};

export const useUserBlockMutation = () => {
  return useTokenAuthMutation(queryHandler);
};

export const useUserBlocksQuery = (options = {}) => {
  return useTokenAuthQuery<UserHeader[]>('/users/blocks', options);
};
