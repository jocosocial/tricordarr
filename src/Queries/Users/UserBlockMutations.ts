import {useSwiftarrQueryClient} from '#src/Context/Contexts/SwiftarrQueryClientContext.ts';
import {useTokenAuthMutation} from '#src/Queries/TokenAuthMutation.ts';

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
