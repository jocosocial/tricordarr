import {useQueryClient} from '@tanstack/react-query';

import {useSwiftarrQueryClient} from '#src/Context/Contexts/SwiftarrQueryClientContext';
import {useTokenAuthMutation} from '#src/Queries/TokenAuthMutation';
import {RegistrationCodeUserData} from '#src/Structs/ControllerStructs';

interface UnlockRegCodeMutationProps {
  userID: string;
}

export const useUnlockRegCodeMutation = () => {
  const {apiPost} = useSwiftarrQueryClient();
  const queryClient = useQueryClient();

  const mutationFn = async ({userID}: UnlockRegCodeMutationProps) => {
    return await apiPost<RegistrationCodeUserData>(`/admin/regcodes/unlock/${userID}`);
  };

  return useTokenAuthMutation(mutationFn, {
    onSuccess: (_data, variables) => {
      const keys = RegistrationCodeUserData.getCacheKeys(variables.userID);
      keys.forEach(key => queryClient.invalidateQueries({queryKey: key}));
    },
  });
};
