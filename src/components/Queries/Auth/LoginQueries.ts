import {getAuthHeaders} from '../../../libraries/Network/APIClient';
import {AxiosResponse} from 'axios';
import {TokenStringData} from '../../../libraries/Structs/ControllerStructs';
import {useTokenAuthMutation} from '../TokenAuthMutation';
import {useSwiftarrQueryClient} from '../../Context/Contexts/SwiftarrQueryClientContext.ts';

interface LoginMutationProps {
  username: string;
  password: string;
}

export const useLoginQuery = () => {
  const {ServerQueryClient} = useSwiftarrQueryClient();

  const queryHandler = async ({username, password}: LoginMutationProps): Promise<AxiosResponse<TokenStringData>> => {
    let authHeaders = getAuthHeaders(username, password);
    return await ServerQueryClient.post('/auth/login', {}, {headers: authHeaders});
  };

  return useTokenAuthMutation(queryHandler);
};
