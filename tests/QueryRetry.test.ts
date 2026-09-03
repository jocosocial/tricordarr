import {AxiosError} from 'axios';

import {isHttpClientError, shouldRetryQuery} from '#src/Libraries/Network/Retry';

/**
 * Minimal AxiosError with an optional HTTP status. `isAxiosError` is true so
 * `isAxiosError()` from axios recognizes it.
 */
function axiosError(status?: number): AxiosError {
  const error = new AxiosError(`Request failed${status !== undefined ? ` with status ${status}` : ''}`);
  error.isAxiosError = true;
  if (status !== undefined) {
    error.response = {status} as AxiosError['response'];
  }
  return error;
}

describe('isHttpClientError', () => {
  it.each([400, 401, 404, 429])('is true for HTTP %s', status => {
    expect(isHttpClientError(axiosError(status))).toBe(true);
  });

  it('is false for HTTP 500', () => {
    expect(isHttpClientError(axiosError(500))).toBe(false);
  });

  it('is false for a response-less network error', () => {
    expect(isHttpClientError(axiosError())).toBe(false);
    expect(isHttpClientError(new Error('Network Error'))).toBe(false);
  });
});

describe('shouldRetryQuery', () => {
  const retry = shouldRetryQuery(2);

  it.each([400, 401, 404, 429])('does not retry HTTP %s on the first failure', status => {
    expect(retry(0, axiosError(status))).toBe(false);
  });

  it('retries a 500 until failureCount reaches maxRetries', () => {
    const error = axiosError(500);
    expect(retry(0, error)).toBe(true);
    expect(retry(1, error)).toBe(true);
    expect(retry(2, error)).toBe(false);
  });

  it('retries a response-less network error', () => {
    expect(retry(0, axiosError())).toBe(true);
    expect(retry(1, new Error('Network Error'))).toBe(true);
  });

  it('never retries when maxRetries is 0', () => {
    const never = shouldRetryQuery(0);
    expect(never(0, axiosError(500))).toBe(false);
    expect(never(0, new Error('Network Error'))).toBe(false);
  });
});
