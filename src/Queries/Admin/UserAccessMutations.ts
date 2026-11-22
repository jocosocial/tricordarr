import {useSwiftarrQueryClient} from '#src/Context/Contexts/SwiftarrQueryClientContext';
import {UserAccessLevel} from '#src/Enums/UserAccessLevel';
import {useUserCacheReducer} from '#src/Hooks/User/useUserCacheReducer';
import {useTokenAuthMutation} from '#src/Queries/TokenAuthMutation';
import {UserHeader} from '#src/Structs/ControllerStructs';

export type UserAccessPromoteTarget = UserAccessLevel.moderator | UserAccessLevel.twitarrteam | UserAccessLevel.tho;

interface PromoteUserProps {
  user: UserHeader;
  target: UserAccessPromoteTarget;
}

/**
 * Promotes a verified user to one of the privileged access levels. The target doubles as the
 * endpoint segment, since `/admin/:level/promote` uses the access level's raw value.
 */
export const usePromoteUserAccessMutation = () => {
  const {apiPost} = useSwiftarrQueryClient();
  const {setAccessLevel} = useUserCacheReducer();

  const mutationFn = async ({user, target}: PromoteUserProps) => {
    return await apiPost(`/admin/${target}/promote/${user.userID}`);
  };

  return useTokenAuthMutation(mutationFn, {
    onSuccess: (_data, variables) => setAccessLevel(variables.user, variables.target),
  });
};

/**
 * Returns a privileged user to Verified.
 */
export const useDemoteUserAccessMutation = () => {
  const {apiPost} = useSwiftarrQueryClient();
  const {setAccessLevel} = useUserCacheReducer();

  const mutationFn = async (user: UserHeader) => {
    return await apiPost(`/admin/user/demote/${user.userID}`);
  };

  return useTokenAuthMutation(mutationFn, {
    onSuccess: (_data, user) => setAccessLevel(user, UserAccessLevel.verified),
  });
};
