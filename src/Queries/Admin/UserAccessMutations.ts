import {useQueryClient} from '@tanstack/react-query';

import {useSwiftarrQueryClient} from '#src/Context/Contexts/SwiftarrQueryClientContext';
import {useTokenAuthMutation} from '#src/Queries/TokenAuthMutation';
import {AdminAccessLevelListData} from '#src/Structs/AdminControllerStructs';
import {UserHeader} from '#src/Structs/ControllerStructs';

export type UserAccessPromoteTarget = 'moderator' | 'twitarrteam' | 'tho';

interface PromoteUserProps {
  userID: string;
  target: UserAccessPromoteTarget;
}

export const usePromoteUserAccessMutation = () => {
  const {apiPost} = useSwiftarrQueryClient();
  const queryClient = useQueryClient();

  const mutationFn = async ({userID, target}: PromoteUserProps) => {
    return await apiPost(`/admin/${target}/promote/${userID}`);
  };

  return useTokenAuthMutation(mutationFn, {
    onSuccess: () => {
      AdminAccessLevelListData.getCacheKeys()
        .concat(UserHeader.getCacheKeys())
        .forEach(key => queryClient.invalidateQueries({queryKey: key}));
    },
  });
};

export const useDemoteUserAccessMutation = () => {
  const {apiPost} = useSwiftarrQueryClient();
  const queryClient = useQueryClient();

  const mutationFn = async (userID: string) => {
    return await apiPost(`/admin/user/demote/${userID}`);
  };

  return useTokenAuthMutation(mutationFn, {
    onSuccess: () => {
      AdminAccessLevelListData.getCacheKeys()
        .concat(UserHeader.getCacheKeys())
        .forEach(key => queryClient.invalidateQueries({queryKey: key}));
    },
  });
};
