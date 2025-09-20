import {useSwiftarrQueryClient} from '#src/Context/Contexts/SwiftarrQueryClientContext';
import {useTokenAuthMutation} from '#src/Queries/TokenAuthMutation';

export const useLogoutMutation = (options = {}) => {
  const {apiPost} = useSwiftarrQueryClient();

  const queryHandler = async () => {
    return await apiPost('/auth/logout');
  };

  return useTokenAuthMutation(queryHandler, options);
};
