import {AxiosError} from 'axios';
import {ErrorResponse} from '../../libraries/Structs/ControllerStructs';
import {MutationFunction} from '@tanstack/query-core';
import {UseMutationResult} from '@tanstack/react-query';
import {useMutation, UseMutationOptions} from '@tanstack/react-query';
import {useErrorHandler} from '../Context/Contexts/ErrorHandlerContext';

/**
 * Common mutation wrapper. Somewhat of a misnomer being called "Token Auth Mutation" because
 * there is no check to see if you're logged in or not.
 * @param mutationFn
 * @param options
 */
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
      setErrorMessage(error.response?.data.reason || error);
    },
    ...options,
  });
}
