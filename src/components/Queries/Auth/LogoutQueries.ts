import {useTokenAuthMutation} from '../TokenAuthMutation';
import {useSwiftarrQueryClient} from '../../Context/Contexts/SwiftarrQueryClientContext.ts';

export const useLogoutMutation = (options = {}) => {
  const {ServerQueryClient} = useSwiftarrQueryClient();

  const queryHandler = async () => {
    return await ServerQueryClient.post('/auth/logout');
  };

  return useTokenAuthMutation(queryHandler, options);
};
