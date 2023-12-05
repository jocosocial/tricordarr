import {AxiosError} from 'axios';
import {ErrorResponse} from '../../libraries/Structs/ControllerStructs';
import {MutationFunction} from '@tanstack/query-core';
import {UseMutationResult} from '@tanstack/react-query/src/types';
import {useMutation, UseMutationOptions} from '@tanstack/react-query';
import {useErrorHandler} from '../Context/Contexts/ErrorHandlerContext';

export function useTokenAuthMutation<
  TData = unknown,
  TError extends Error = AxiosError<ErrorResponse>,
  TVariables = void,
  TContext = unknown,
>(
  mutationFn: MutationFunction<TData, TVariables>,
  options?: Omit<UseMutationOptions<TData, TError, TVariables, TContext>, 'mutationFn'>,
): UseMutationResult<TData, TError, TVariables, TContext> {
  const {setErrorMessage} = useErrorHandler();
  return useMutation<TData, TError, TVariables, TContext>(mutationFn, {
    onError: error => {
      setErrorMessage(error);
    },
    ...options,
  });
}
