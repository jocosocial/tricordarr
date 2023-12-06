import axios, {AxiosResponse} from 'axios';
import {FezData} from '../../../libraries/Structs/ControllerStructs';
import {useTokenAuthMutation} from '../TokenAuthMutation';

interface FezMembershipMutationProps {
  fezID: string;
  action: 'join' | 'unjoin';
}

const queryHandler = async ({fezID, action}: FezMembershipMutationProps): Promise<AxiosResponse<FezData>> => {
  return await axios.post(`/fez/${fezID}/${action}`);
};

export const useFezMembershipMutation = () => {
  return useTokenAuthMutation(queryHandler);
};
