import {useSwiftarrQueryClient} from '#src/Context/Contexts/SwiftarrQueryClientContext';
import {usePublicMutation} from '#src/Queries/PublicMutation';
import {useTokenAuthMutation} from '#src/Queries/TokenAuthMutation';
import {TokenStringData, UserHeader, UserRecoveryData, UserUsernameLookupData} from '#src/Structs/ControllerStructs';

export const useUserRecoveryMutation = () => {
  const {apiPost} = useSwiftarrQueryClient();

  const recoveryHandler = async (recoveryData: UserRecoveryData) => {
    return await apiPost<TokenStringData, UserRecoveryData>('/auth/recovery', recoveryData);
  };

  return useTokenAuthMutation(recoveryHandler);
};

/**
 * Looks up the username of an account from its registration code plus either the account
 * password or the recovery key. For users who have those but have forgotten their username,
 * which `useUserRecoveryMutation` requires. Unauthenticated, hence `usePublicMutation`.
 *
 * `apiPost` rather than `publicPost` because the endpoint lives under the API URL prefix, and
 * the Authorization header is only attached when there is a logged-in session anyway.
 */
export const useUsernameLookupMutation = () => {
  const {apiPost} = useSwiftarrQueryClient();

  const lookupHandler = async (lookupData: UserUsernameLookupData) => {
    return await apiPost<UserHeader, UserUsernameLookupData>('/auth/username', lookupData);
  };

  return usePublicMutation(lookupHandler);
};
