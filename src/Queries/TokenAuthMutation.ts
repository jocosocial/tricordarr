import {AxiosError} from 'axios';
import {ErrorResponse} from '../../Libraries/Structs/ControllerStructs.tsx';
import {MutationFunction} from '@tanstack/query-core';
import {UseMutationResult} from '@tanstack/react-query';
import {useMutation, UseMutationOptions} from '@tanstack/react-query';
import {useSnackbar} from '#src/Context/Contexts/SnackbarContext.ts';

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
  const {setSnackbarPayload} = useSnackbar();
  return useMutation<TData, TError, TVariables, TContext>(mutationFn, {
    onError: error => {
      setSnackbarPayload({message: error.response?.data.reason || String(error), messageType: 'error'});
      console.error('[TokenAuthMutation.ts]', error);
    },
    ...options,
  });
}
