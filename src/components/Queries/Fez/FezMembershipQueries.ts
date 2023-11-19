import axios, {AxiosError, AxiosResponse} from 'axios';
import {ErrorResponse, FezData} from '../../../libraries/Structs/ControllerStructs';
import {useErrorHandler} from '../../Context/Contexts/ErrorHandlerContext';
import {useMutation} from '@tanstack/react-query';

interface FezMembershipMutationProps {
  fezID: string;
  action: 'join' | 'unjoin';
}

const queryHandler = async ({fezID, action}: FezMembershipMutationProps): Promise<AxiosResponse<FezData>> => {
  return await axios.post(`/fez/${fezID}/${action}`);
};

export const useFezMembershipMutation = (retry = 0) => {
  const {setErrorMessage} = useErrorHandler();
  return useMutation<AxiosResponse<FezData>, AxiosError<ErrorResponse>, FezMembershipMutationProps>(queryHandler, {
    retry: retry,
    onError: error => {
      setErrorMessage(error.response?.data.reason || error.message);
    },
  });
};
