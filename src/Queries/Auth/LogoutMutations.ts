import {useSwiftarrQueryClient} from '#src/Context/Contexts/SwiftarrQueryClientContext';
import {useTokenAuthMutation} from '#src/Queries/TokenAuthMutation';

/**
 * POST /auth/logout — invalidate the token on the server (all devices).
 * confirmLogout only calls this when allDevices is true, and only runs
 * finishLogout after onSuccess so a failed request does not locally sign out
 * or navigate away.
 */
export const useLogoutMutation = (options = {}) => {
  const {apiPost} = useSwiftarrQueryClient();

  const queryHandler = async () => {
    return await apiPost('/auth/logout');
  };

  return useTokenAuthMutation(queryHandler, options);
};
