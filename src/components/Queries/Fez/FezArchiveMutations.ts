import {useTokenAuthMutation} from '../TokenAuthMutation';
import {useSwiftarrQueryClient} from '../../Context/Contexts/SwiftarrQueryClientContext.ts';

interface FezArchiveMutationProps {
  fezID: string;
  action: 'archive' | 'unarchive';
}

export const useFezArchiveMutation = () => {
  const {apiPost, apiDelete} = useSwiftarrQueryClient();

  const queryHandler = async ({fezID, action}: FezArchiveMutationProps) => {
    if (action === 'unarchive') {
      return await apiDelete(`/fez/${fezID}/archive`);
    }
    return await apiPost(`/fez/${fezID}/archive`);
  };

  return useTokenAuthMutation(queryHandler);
};
