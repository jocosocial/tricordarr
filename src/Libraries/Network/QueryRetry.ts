import {isAxiosError} from 'axios';

/**
 * Returns true when the error is an HTTP 404 from Axios.
 * A 404 is a definitive not-found from the server, not a transient failure.
 */
export function isNotFoundError(error: unknown): boolean {
  return isAxiosError(error) && error.response?.status === 404;
}

/**
 * React Query retry predicate.
 * 404s are never retried. Other errors retry while failureCount is below maxRetries,
 * matching React Query's numeric `retry` behavior.
 *
 * @param failureCount Number of failures so far (0 after the first failed attempt).
 * @param error The error that caused the failure.
 * @param maxRetries Configured retry count (same meaning as React Query's numeric `retry`).
 */
export function shouldRetryQuery(failureCount: number, error: unknown, maxRetries: number): boolean {
  if (isNotFoundError(error)) {
    return false;
  }
  return failureCount < maxRetries;
}
