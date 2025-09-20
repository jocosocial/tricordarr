import {FezData} from '#src/Structs/ControllerStructs';
import {useTokenAuthMutation} from '#src/Queries/TokenAuthMutation';
import {useSwiftarrQueryClient} from '#src/Context/Contexts/SwiftarrQueryClientContext';

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
