import axios, {AxiosResponse} from 'axios';
import {FezData} from '../../../../libraries/Structs/ControllerStructs';
import {useTokenAuthMutation} from '../../TokenAuthMutation';

interface ParticipantMutationProps {
  fezID: string;
  userID: string;
  action: 'add' | 'remove';
}

const queryHandler = async ({fezID, userID, action}: ParticipantMutationProps): Promise<AxiosResponse<FezData>> => {
  return await axios.post(`/fez/${fezID}/user/${userID}/${action}`);
};

export const useFezParticipantMutation = () => {
  return useTokenAuthMutation(queryHandler);
};
