import {useSwiftarrQueryClient} from '../../Context/Contexts/SwiftarrQueryClientContext.ts';
import {useTokenAuthMutation} from '../TokenAuthMutation.ts';

interface UserBlockMutationProps {
  userID: string;
  action: 'block' | 'unblock';
}

export const useUserBlockMutation = () => {
  const {apiPost} = useSwiftarrQueryClient();

  const queryHandler = async ({userID, action}: UserBlockMutationProps) => {
    return await apiPost(`/users/${userID}/${action}`);
  };

  return useTokenAuthMutation(queryHandler);
};
