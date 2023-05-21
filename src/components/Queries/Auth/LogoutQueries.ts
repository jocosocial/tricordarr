import {useMutation} from '@tanstack/react-query';
import axios, {AxiosError, AxiosResponse} from 'axios';
import {useErrorHandler} from '../../Context/Contexts/ErrorHandlerContext';
import {ErrorResponse} from '../../../libraries/Structs/ControllerStructs';

export const useLogoutMutation = (options = {}) => {
  const {setErrorMessage} = useErrorHandler();
  return useMutation<AxiosResponse<void>, AxiosError<ErrorResponse>>(
    async () => {
      return await axios.post('/auth/logout');
    },
    {
      onError: error => {
        setErrorMessage(error.response?.data.reason);
      },
      ...options,
    },
  );
};
