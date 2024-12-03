import {AxiosResponse} from 'axios';
import {useTokenAuthMutation} from '../TokenAuthMutation';
import {useSwiftarrQueryClient} from '../../Context/Contexts/SwiftarrQueryClientContext.ts';

interface FezMuteMutationProps {
  fezID: string;
  action: 'mute' | 'unmute';
}

export const useFezMuteMutation = () => {
  const {ServerQueryClient} = useSwiftarrQueryClient();

  const queryHandler = async ({fezID, action}: FezMuteMutationProps): Promise<AxiosResponse<void>> => {
    if (action === 'unmute') {
      return await ServerQueryClient.delete(`/fez/${fezID}/mute`);
    }
    return await ServerQueryClient.post(`/fez/${fezID}/mute`);
  };

  return useTokenAuthMutation(queryHandler);
};
