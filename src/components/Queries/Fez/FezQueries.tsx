import axios, {AxiosError, AxiosResponse} from 'axios';
import {useMutation, useQuery} from '@tanstack/react-query';
import {ErrorResponse, FezContentData, FezData, FezListData} from '../../../libraries/Structs/ControllerStructs';
import {useErrorHandler} from '../../Context/Contexts/ErrorHandlerContext';
import {PrivilegedUserAccounts} from '../../../libraries/Enums/UserAccessLevel';

// https://medium.com/@deshan.m/reusable-react-query-hooks-with-typescript-simplifying-api-calls-f2583b24c82a

interface FezMutationProps {
  fezContentData: FezContentData;
}

const queryHandler = async ({fezContentData}: FezMutationProps): Promise<AxiosResponse<FezData>> => {
  return await axios.post('/fez/create', fezContentData);
};

export const useFezMutation = (retry = 0) => {
  const {setErrorMessage} = useErrorHandler();
  return useMutation<AxiosResponse<FezData>, AxiosError<ErrorResponse>, FezMutationProps>(queryHandler, {
    retry: retry,
    onError: error => {
      setErrorMessage(error.response?.data.reason);
    },
  });
};

export const useSeamailQuery = (forUser?: keyof typeof PrivilegedUserAccounts) => {
  let queryRoute = '/fez/joined?type=closed&type=open';
  if (forUser) {
    queryRoute = `${queryRoute}&foruser=${forUser}`;
  }
  return useQuery<FezListData>({
    queryKey: [queryRoute],
  });
};
