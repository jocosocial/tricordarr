import {FezData} from '../../../Libraries/Structs/ControllerStructs.tsx';
import {useTokenAuthMutation} from '#src/Queries/TokenAuthMutation.ts';
import {useSwiftarrQueryClient} from '#src/Context/Contexts/SwiftarrQueryClientContext.ts';

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
