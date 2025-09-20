import {useSwiftarrQueryClient} from '#src/Context/Contexts/SwiftarrQueryClientContext';
import {useTokenAuthMutation} from '#src/Queries/TokenAuthMutation';
import {FezData} from '#src/Structs/ControllerStructs';

interface FezMembershipMutationProps {
  fezID: string;
  action: 'join' | 'unjoin';
}

export const useFezMembershipMutation = () => {
  const {apiPost} = useSwiftarrQueryClient();

  const queryHandler = async ({fezID, action}: FezMembershipMutationProps) => {
    return await apiPost<FezData>(`/fez/${fezID}/${action}`);
  };

  return useTokenAuthMutation(queryHandler);
};
