import {FezData} from '../../../../libraries/Structs/ControllerStructs';
import {useTokenAuthMutation} from '../../TokenAuthMutation';
import {useSwiftarrQueryClient} from '../../../Context/Contexts/SwiftarrQueryClientContext.ts';

interface ParticipantMutationProps {
  fezID: string;
  userID: string;
  action: 'add' | 'remove';
}

export const useFezParticipantMutation = () => {
  const {apiPost} = useSwiftarrQueryClient();

  const queryHandler = async ({fezID, userID, action}: ParticipantMutationProps) => {
    return await apiPost<FezData>(`/fez/${fezID}/user/${userID}/${action}`);
  };

  return useTokenAuthMutation(queryHandler);
};
