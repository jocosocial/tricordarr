import {isAxiosError} from 'axios';

/**
 * True when the error is an Axios HTTP response in the 4XX client-error range.
 * Network failures and 5XX responses are not client errors.
 */
export const isHttpClientError = (error: Error): boolean => {
  const status = isAxiosError(error) ? error.response?.status : undefined;
  return status !== undefined && status >= 400 && status < 500;
};

/**
 * React Query retry predicate that never retries HTTP 4XX responses.
 * Other failures (5XX, timeouts, network errors) retry until `failureCount`
 * reaches `maxRetries`, matching React Query's numeric `retry` semantics.
 */
export const shouldRetryQuery =
  (maxRetries: number) =>
  (failureCount: number, error: Error): boolean => {
    if (isHttpClientError(error)) {
      return false;
    }
    return failureCount < maxRetries;
  };
