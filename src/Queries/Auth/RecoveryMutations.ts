import {useTokenAuthMutation} from '#src/Queries/TokenAuthMutation.ts';
import {TokenStringData, UserRecoveryData} from '../../../Libraries/Structs/ControllerStructs.tsx';
import {useSwiftarrQueryClient} from '#src/Context/Contexts/SwiftarrQueryClientContext.ts';

export const useUserRecoveryMutation = () => {
  const {apiPost} = useSwiftarrQueryClient();

  const recoveryHandler = async (recoveryData: UserRecoveryData) => {
    return await apiPost<TokenStringData, UserRecoveryData>('/auth/recovery', recoveryData);
  };

  return useTokenAuthMutation(recoveryHandler);
};
