import {AxiosResponse} from 'axios';
import {UserHeader} from '../../../libraries/Structs/ControllerStructs';
import {useTokenAuthQuery} from '../TokenAuthQuery';
import {useTokenAuthMutation} from '../TokenAuthMutation';
import {useSwiftarrQueryClient} from '../../Context/Contexts/SwiftarrQueryClientContext.ts';

interface UserBlockMutationProps {
  userID: string;
  action: 'block' | 'unblock';
}

export const useUserBlockMutation = () => {
  const {ServerQueryClient} = useSwiftarrQueryClient();

  const queryHandler = async ({userID, action}: UserBlockMutationProps): Promise<AxiosResponse<void>> => {
    return await ServerQueryClient.post(`/users/${userID}/${action}`);
  };

  return useTokenAuthMutation(queryHandler);
};

export const useUserBlocksQuery = (options = {}) => {
  return useTokenAuthQuery<UserHeader[]>('/users/blocks', options);
};
