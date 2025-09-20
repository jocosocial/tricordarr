import {getAuthHeaders} from '../../../Libraries/Network/APIClient.ts';
import {TokenStringData} from '../../../Libraries/Structs/ControllerStructs.tsx';
import {useTokenAuthMutation} from '#src/Queries/TokenAuthMutation.ts';
import {useSwiftarrQueryClient} from '#src/Context/Contexts/SwiftarrQueryClientContext.ts';

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
