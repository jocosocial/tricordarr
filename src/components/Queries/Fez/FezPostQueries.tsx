import axios, {AxiosError, AxiosResponse} from 'axios';
import {ErrorResponse, FezPostData, PostContentData} from '../../../libraries/Structs/ControllerStructs';
import {useMutation} from '@tanstack/react-query';
import {useErrorHandler} from '../../Context/Contexts/ErrorHandlerContext';

// https://medium.com/@deshan.m/reusable-react-query-hooks-with-typescript-simplifying-api-calls-f2583b24c82a

interface FezPostMutationProps {
  fezID: string;
  postContentData: PostContentData;
}

const queryHandler = async ({fezID, postContentData}: FezPostMutationProps): Promise<AxiosResponse<FezPostData>> => {
  return await axios.post(`/fez/${fezID}/post`, postContentData);
};

export const useFezPostMutation = (retry = 0) => {
  const {setErrorMessage} = useErrorHandler();
  return useMutation<AxiosResponse<FezPostData>, AxiosError<ErrorResponse>, FezPostMutationProps>(queryHandler, {
    retry: retry,
    onError: error => {
      setErrorMessage(error.response?.data.reason);
    },
  });
};
