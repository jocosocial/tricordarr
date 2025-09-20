import {FezData} from '#src/Structs/ControllerStructs';
import {useTokenAuthMutation} from '#src/Queries/TokenAuthMutation';
import {useSwiftarrQueryClient} from '#src/Context/Contexts/SwiftarrQueryClientContext';

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
