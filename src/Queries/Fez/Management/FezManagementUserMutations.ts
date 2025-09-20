import {FezData} from '../../../../Libraries/Structs/ControllerStructs.tsx';
import {useTokenAuthMutation} from '../../TokenAuthMutation.ts';
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
