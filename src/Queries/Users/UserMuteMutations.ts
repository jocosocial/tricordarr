import {useSwiftarrQueryClient} from '#src/Context/Contexts/SwiftarrQueryClientContext';
import {useTokenAuthMutation} from '#src/Queries/TokenAuthMutation';

interface UserMuteMutationProps {
  userID: string;
  action: 'mute' | 'unmute';
}

export const useUserMuteMutation = () => {
  const {apiPost} = useSwiftarrQueryClient();

  const queryHandler = async ({userID, action}: UserMuteMutationProps) => {
    return await apiPost(`/users/${userID}/${action}`);
  };

  return useTokenAuthMutation(queryHandler);
};
