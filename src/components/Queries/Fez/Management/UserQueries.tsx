import {AxiosResponse} from 'axios';
import {FezData} from '../../../../libraries/Structs/ControllerStructs';
import {useTokenAuthMutation} from '../../TokenAuthMutation';
import {useSwiftarrQueryClient} from '../../../Context/Contexts/SwiftarrQueryClientContext.ts';

interface ParticipantMutationProps {
  fezID: string;
  userID: string;
  action: 'add' | 'remove';
}

export const useFezParticipantMutation = () => {
  const {ServerQueryClient} = useSwiftarrQueryClient();

  const queryHandler = async ({fezID, userID, action}: ParticipantMutationProps): Promise<AxiosResponse<FezData>> => {
    return await ServerQueryClient.post(`/fez/${fezID}/user/${userID}/${action}`);
  };

  return useTokenAuthMutation(queryHandler);
};
