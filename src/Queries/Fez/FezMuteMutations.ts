import {useSwiftarrQueryClient} from '#src/Context/Contexts/SwiftarrQueryClientContext';
import {useTokenAuthMutation} from '#src/Queries/TokenAuthMutation';

interface FezMuteMutationProps {
  fezID: string;
  action: 'mute' | 'unmute';
}

export const useFezMuteMutation = () => {
  const {apiPost, apiDelete} = useSwiftarrQueryClient();

  const queryHandler = async ({fezID, action}: FezMuteMutationProps) => {
    if (action === 'unmute') {
      return await apiDelete(`/fez/${fezID}/mute`);
    }
    return await apiPost(`/fez/${fezID}/mute`);
  };

  return useTokenAuthMutation(queryHandler);
};
