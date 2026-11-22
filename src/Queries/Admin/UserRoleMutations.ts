import {useSwiftarrQueryClient} from '#src/Context/Contexts/SwiftarrQueryClientContext';
import {UserRoleType} from '#src/Enums/UserRoleType';
import {useUserCacheReducer} from '#src/Hooks/User/useUserCacheReducer';
import {useTokenAuthMutation} from '#src/Queries/TokenAuthMutation';
import {UserHeader} from '#src/Structs/ControllerStructs';

interface UserRoleMutationProps {
  role: UserRoleType;
  user: UserHeader;
}

/**
 * THO endpoint to give a user any role.
 */
export const useAddUserRoleMutation = () => {
  const {apiPost} = useSwiftarrQueryClient();
  const {grantRole} = useUserCacheReducer();

  const mutationFn = async ({role, user}: UserRoleMutationProps) => {
    return await apiPost(`/admin/userroles/${role}/addrole/${user.userID}`);
  };

  return useTokenAuthMutation(mutationFn, {
    onSuccess: (_data, variables) => grantRole(variables.role, variables.user),
  });
};

/**
 * THO endpoint to remove any role from a user.
 */
export const useRemoveUserRoleMutation = () => {
  const {apiPost} = useSwiftarrQueryClient();
  const {revokeRole} = useUserCacheReducer();

  const mutationFn = async ({role, user}: UserRoleMutationProps) => {
    return await apiPost(`/admin/userroles/${role}/removerole/${user.userID}`);
  };

  return useTokenAuthMutation(mutationFn, {
    onSuccess: (_data, variables) => revokeRole(variables.role, variables.user),
  });
};

interface ShutternautRoleMutationProps {
  user: UserHeader;
}

/**
 * Shutternaut Manager endpoint to give a user the Shutternaut role. Unlike the admin endpoint it
 * only accepts the `shutternaut` role.
 */
export const useAddShutternautMutation = () => {
  const {apiPost} = useSwiftarrQueryClient();
  const {grantRole} = useUserCacheReducer();

  const mutationFn = async ({user}: ShutternautRoleMutationProps) => {
    return await apiPost(`/users/userrole/${UserRoleType.shutternaut}/addrole/${user.userID}`);
  };

  return useTokenAuthMutation(mutationFn, {
    onSuccess: (_data, variables) => grantRole(UserRoleType.shutternaut, variables.user),
  });
};

/**
 * Shutternaut Manager endpoint to remove the Shutternaut role from a user.
 */
export const useRemoveShutternautMutation = () => {
  const {apiPost} = useSwiftarrQueryClient();
  const {revokeRole} = useUserCacheReducer();

  const mutationFn = async ({user}: ShutternautRoleMutationProps) => {
    return await apiPost(`/users/userrole/${UserRoleType.shutternaut}/removerole/${user.userID}`);
  };

  return useTokenAuthMutation(mutationFn, {
    onSuccess: (_data, variables) => revokeRole(UserRoleType.shutternaut, variables.user),
  });
};
