import {useSwiftarrQueryClient} from '#src/Context/Contexts/SwiftarrQueryClientContext';
import {getAuthHeaders} from '#src/Libraries/Network/APIClient';
import {useTokenAuthMutation} from '#src/Queries/TokenAuthMutation';
import {TokenStringData} from '#src/Structs/ControllerStructs';

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
