import {useTokenAuthMutation} from '#src/Queries/TokenAuthMutation';
import {useSwiftarrQueryClient} from '#src/Context/Contexts/SwiftarrQueryClientContext';

export const useLogoutMutation = (options = {}) => {
  const {apiPost} = useSwiftarrQueryClient();

  const queryHandler = async () => {
    return await apiPost('/auth/logout');
  };

  return useTokenAuthMutation(queryHandler, options);
};
