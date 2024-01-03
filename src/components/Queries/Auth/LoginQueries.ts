import {getAuthHeaders} from '../../../libraries/Network/APIClient';
import axios, {AxiosResponse} from 'axios';
import {TokenStringData} from '../../../libraries/Structs/ControllerStructs';
import {useTokenAuthMutation} from '../TokenAuthMutation';

interface LoginMutationProps {
  username: string;
  password: string;
}

const queryHandler = async ({username, password}: LoginMutationProps): Promise<AxiosResponse<TokenStringData>> => {
  let authHeaders = getAuthHeaders(username, password);
  return await axios.post('/auth/login', {}, {headers: authHeaders});
};

export const useLoginQuery = () => {
  return useTokenAuthMutation(queryHandler);
};
