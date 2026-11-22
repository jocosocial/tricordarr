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

interface ShutternautRoleMutationProps {
  userID: string;
}

/**
 * Invalidates every list that could show a change to the Shutternaut role.
 */
const useInvalidateShutternautLists = () => {
  const queryClient = useQueryClient();
  return () =>
    AdminUserRoleListData.getCacheKeys(UserRoleType.shutternaut)
      .concat(UserHeader.getCacheKeys())
      .forEach(key => queryClient.invalidateQueries({queryKey: key}));
};

/**
 * Shutternaut Manager endpoint to give a user the Shutternaut role. Unlike the admin endpoint it
 * only accepts the `shutternaut` role.
 */
export const useAddShutternautMutation = () => {
  const {apiPost} = useSwiftarrQueryClient();
  const invalidate = useInvalidateShutternautLists();

  const mutationFn = async ({userID}: ShutternautRoleMutationProps) => {
    return await apiPost(`/users/userrole/${UserRoleType.shutternaut}/addrole/${userID}`);
  };

  return useTokenAuthMutation(mutationFn, {onSuccess: invalidate});
};

/**
 * Shutternaut Manager endpoint to remove the Shutternaut role from a user.
 */
export const useRemoveShutternautMutation = () => {
  const {apiPost} = useSwiftarrQueryClient();
  const invalidate = useInvalidateShutternautLists();

  const mutationFn = async ({userID}: ShutternautRoleMutationProps) => {
    return await apiPost(`/users/userrole/${UserRoleType.shutternaut}/removerole/${userID}`);
  };

  return useTokenAuthMutation(mutationFn, {onSuccess: invalidate});
};
