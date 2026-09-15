import {useQueryClient} from '@tanstack/react-query';

import {useSwiftarrQueryClient} from '#src/Context/Contexts/SwiftarrQueryClientContext';
import {UserRoleType} from '#src/Enums/UserRoleType';
import {useTokenAuthMutation} from '#src/Queries/TokenAuthMutation';
import {AdminUserRoleListData} from '#src/Structs/AdminControllerStructs';
import {UserHeader} from '#src/Structs/ControllerStructs';

interface UserRoleMutationProps {
  role: UserRoleType;
  userID: string;
}

export const useAddUserRoleMutation = () => {
  const {apiPost} = useSwiftarrQueryClient();
  const queryClient = useQueryClient();

  const mutationFn = async ({role, userID}: UserRoleMutationProps) => {
    return await apiPost(`/admin/userroles/${role}/addrole/${userID}`);
  };

  return useTokenAuthMutation(mutationFn, {
    onSuccess: (_data, variables) => {
      AdminUserRoleListData.getCacheKeys(variables.role)
        .concat(UserHeader.getCacheKeys())
        .forEach(key => queryClient.invalidateQueries({queryKey: key}));
    },
  });
};

export const useRemoveUserRoleMutation = () => {
  const {apiPost} = useSwiftarrQueryClient();
  const queryClient = useQueryClient();

  const mutationFn = async ({role, userID}: UserRoleMutationProps) => {
    return await apiPost(`/admin/userroles/${role}/removerole/${userID}`);
  };

  return useTokenAuthMutation(mutationFn, {
    onSuccess: (_data, variables) => {
      AdminUserRoleListData.getCacheKeys(variables.role)
        .concat(UserHeader.getCacheKeys())
        .forEach(key => queryClient.invalidateQueries({queryKey: key}));
    },
  });
};
