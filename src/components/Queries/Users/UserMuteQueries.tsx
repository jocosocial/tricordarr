import {AxiosResponse} from 'axios';
import {UserHeader} from '../../../libraries/Structs/ControllerStructs';
import {useTokenAuthQuery} from '../TokenAuthQuery';
import {useTokenAuthMutation} from '../TokenAuthMutation';
import {useSwiftarrQueryClient} from '../../Context/Contexts/SwiftarrQueryClientContext.ts';

interface UserMuteMutationProps {
  userID: string;
  action: 'mute' | 'unmute';
}

export const useUserMuteMutation = () => {
  const {ServerQueryClient} = useSwiftarrQueryClient();

  const queryHandler = async ({userID, action}: UserMuteMutationProps): Promise<AxiosResponse<void>> => {
    return await ServerQueryClient.post(`/users/${userID}/${action}`);
  };

  return useTokenAuthMutation(queryHandler);
};

export const useUserMutesQuery = (options = {}) => {
  return useTokenAuthQuery<UserHeader[]>('/users/mutes', options);
};
