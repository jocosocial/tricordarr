import {getAuthHeaders} from '../../../libraries/Network/APIClient';
import {TokenStringData} from '../../../libraries/Structs/ControllerStructs';
import {useTokenAuthMutation} from '../TokenAuthMutation';
import {useSwiftarrQueryClient} from '../../Context/Contexts/SwiftarrQueryClientContext.ts';

interface LoginMutationProps {
  username: string;
  password: string;
}

export const useLoginMutation = () => {
  const {apiPost} = useSwiftarrQueryClient();

  const queryHandler = async ({username, password}: LoginMutationProps) => {
    let authHeaders = getAuthHeaders(username, password);
    return await apiPost<TokenStringData>('/auth/login', undefined, {headers: authHeaders});
  };

  return useTokenAuthMutation(queryHandler);
};
