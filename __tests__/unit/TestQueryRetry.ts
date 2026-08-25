import {AxiosError, AxiosHeaders, InternalAxiosRequestConfig} from 'axios';

import {isNotFoundError, shouldRetryQuery} from '#src/Libraries/Network/QueryRetry';

/**
 * Build a minimal AxiosError with an HTTP status for retry helper tests.
 */
function axiosErrorWithStatus(status: number): AxiosError {
  const error = new AxiosError(`Request failed with status code ${status}`);
  error.response = {
    status,
    statusText: '',
    data: {},
    headers: {},
    config: {headers: new AxiosHeaders()} as InternalAxiosRequestConfig,
  };
  return error;
}

describe('isNotFoundError', () => {
  it('returns true for HTTP 404', () => {
    expect(isNotFoundError(axiosErrorWithStatus(404))).toBe(true);
  });

  it('returns false for other HTTP errors', () => {
    expect(isNotFoundError(axiosErrorWithStatus(500))).toBe(false);
    expect(isNotFoundError(axiosErrorWithStatus(401))).toBe(false);
  });

  it('returns false for non-Axios errors', () => {
    expect(isNotFoundError(new Error('network down'))).toBe(false);
    expect(isNotFoundError('not an error object')).toBe(false);
  });
});

describe('shouldRetryQuery', () => {
  it('does not retry 404s regardless of failure count', () => {
    expect(shouldRetryQuery(0, axiosErrorWithStatus(404), 2)).toBe(false);
    expect(shouldRetryQuery(1, axiosErrorWithStatus(404), 2)).toBe(false);
  });

  it('retries other errors while below maxRetries', () => {
    expect(shouldRetryQuery(0, axiosErrorWithStatus(500), 2)).toBe(true);
    expect(shouldRetryQuery(1, axiosErrorWithStatus(500), 2)).toBe(true);
    expect(shouldRetryQuery(2, axiosErrorWithStatus(500), 2)).toBe(false);
  });

  it('does not retry when maxRetries is 0', () => {
    expect(shouldRetryQuery(0, axiosErrorWithStatus(500), 0)).toBe(false);
  });
});
