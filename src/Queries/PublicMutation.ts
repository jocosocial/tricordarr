import {MutationFunction} from '@tanstack/query-core';
import {useMutation, UseMutationOptions, UseMutationResult} from '@tanstack/react-query';
import {AxiosError} from 'axios';

import {useSnackbar} from '#src/Context/Contexts/SnackbarContext';
import {ErrorResponse} from '#src/Structs/ControllerStructs';

/**
 * Extracts a formatted error message from an AxiosError, including the HTTP status code.
 * Format: "STATUS: error message"
 * Enhanced based on the error handling pattern in SwiftarrQueryClientProvider.
 * @param error The AxiosError to extract the message from
 * @returns A formatted error message string
 */
function getErrorMessage(error: AxiosError<ErrorResponse>): string {
  const statusCode = error.response?.status;
  let errorMessage: string;

  // Try to extract the reason from the error response data, similar to SwiftarrQueryClientProvider
  if (error.response) {
    try {
      const errorData = error.response.data as ErrorResponse;
      if (errorData?.reason) {
        errorMessage = errorData.reason;
      } else {
        // Fall back to error.message if reason is not available
        errorMessage = error.message || String(error);
      }
    } catch {
      // If we can't parse the error response, use error.message which is cleaner than String(error)
      errorMessage = error.message || String(error);
    }
  } else {
    // No response means network error or request didn't complete
    errorMessage = error.message || String(error);
  }

  // Format with status code prefix if available
  if (statusCode !== undefined) {
    return `${statusCode}: ${errorMessage}`;
  }

  return errorMessage;
}

/**
 * Common mutation wrapper for public endpoints that don't require authentication.
 * Similar to useTokenAuthMutation but uses publicPost instead of apiPost.
 * @param mutationFn
 * @param options
 */
export function usePublicMutation<
  TData = unknown,
  TError extends AxiosError<ErrorResponse> = AxiosError<ErrorResponse>,
  TVariables = void,
  TContext = unknown,
>(
  mutationFn: MutationFunction<TData, TVariables>,
  options?: Omit<UseMutationOptions<TData, TError, TVariables, TContext>, 'mutationFn'>,
): UseMutationResult<TData, TError, TVariables, TContext> {
  const {setSnackbarPayload} = useSnackbar();
  return useMutation<TData, TError, TVariables, TContext>({
    mutationFn: mutationFn,
    onError: error => {
      setSnackbarPayload({message: getErrorMessage(error), messageType: 'error'});
      console.error('[PublicMutation.ts]', error);
    },
    ...options,
  });
}
