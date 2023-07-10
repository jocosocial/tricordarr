import {useMutation} from '@tanstack/react-query';
import {getAuthHeaders} from '../../../libraries/Network/APIClient';
import axios, {AxiosError, AxiosResponse} from 'axios';
import {ErrorResponse, TokenStringData} from '../../../libraries/Structs/ControllerStructs';
import {useErrorHandler} from '../../Context/Contexts/ErrorHandlerContext';

interface LoginMutationProps {
  username: string;
  password: string;
}

const queryHandler = async ({username, password}: LoginMutationProps): Promise<AxiosResponse<TokenStringData>> => {
  let authHeaders = getAuthHeaders(username, password);
  return await axios.post('/auth/login', {}, {headers: authHeaders});
};

export const useLoginQuery = (options = {}) => {
  const {setErrorMessage} = useErrorHandler();
  return useMutation<AxiosResponse<TokenStringData>, AxiosError<ErrorResponse>, LoginMutationProps>(queryHandler, {
    onError: error => {
      setErrorMessage(error.response?.data.reason || error.message);
    },
    ...options,
  });
};
