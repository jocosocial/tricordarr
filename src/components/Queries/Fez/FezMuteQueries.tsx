import axios, {AxiosResponse} from 'axios';
import {useTokenAuthMutation} from '../TokenAuthMutation';

interface FezMuteMutationProps {
  fezID: string;
  action: 'mute' | 'unmute';
}

const queryHandler = async ({fezID, action}: FezMuteMutationProps): Promise<AxiosResponse<void>> => {
  if (action === 'unmute') {
    return await axios.delete(`/fez/${fezID}/mute`);
  }
  return await axios.post(`/fez/${fezID}/mute`);
};

export const useFezMuteMutation = () => {
  return useTokenAuthMutation(queryHandler);
};
