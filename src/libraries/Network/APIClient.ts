// REST API client for interacting with the Swiftarr API.
import {encode as base64_encode} from 'base-64';
import {AxiosResponse} from 'axios';
import {QueryClient} from '@tanstack/react-query';
import {createAsyncStoragePersister} from '@tanstack/query-async-storage-persister';
import AsyncStorage from '@react-native-async-storage/async-storage';
import superjson from 'superjson';

// https://stackoverflow.com/questions/75784817/enforce-that-json-response-is-returned-with-axios
export class BadResponseFormatError extends Error {
  constructor(public response: AxiosResponse) {
    const contentType = response.headers['content-type'];
    const server = response.headers.server;
    super(`Malformed response. Got ${contentType} payload from server ${server}.`);
  }
}

/**
 * Generate the HTTP headers needed to authenticate with the Twitarr API.
 * Behaves differently if given username/password or token.
 * https://stackoverflow.com/questions/246801/how-can-you-encode-a-string-to-base64-in-javascript
 * @param username  Optional String containing the username.
 * @param password  Optional String containing the password.
 * @param token     Optional String containing an OAuth2 token.
 * @returns {{authorization: string}}
 */
export function getAuthHeaders(
  username: string | undefined = undefined,
  password: string | undefined = undefined,
  token: string | undefined = undefined,
) {
  let encodedCredentials = '';
  let authScheme = '';
  if (username && password) {
    encodedCredentials = base64_encode(`${username}:${password}`);
    authScheme = 'Basic';
  } else if (token) {
    encodedCredentials = token;
    authScheme = 'Bearer';
  } else {
    throw new Error('Must specify either username/password or token.');
  }

  const authHeaders = {
    authorization: `${authScheme} ${encodedCredentials}`,
  };
  return authHeaders;
}

/**
 * React-Query Client.
 * https://tanstack.com/query/latest/docs/react/overview
 */
export const SwiftarrQueryClient = new QueryClient();

/**
 * This is here because it gets referenced in the settings.
 */
export const defaultCacheTime = 1000 * 60 * 60 * 24 * 30; // 30 days
export const defaultStaleTime = 1000 * 60; // 60 seconds
export const defaultImageStaleTime = 1000 * 60 * 60 * 24 * 30; // 30 days

/**
 * React-Query Storage Persister.
 */
export const asyncStoragePersister = createAsyncStoragePersister({
  storage: AsyncStorage,
  throttleTime: 1000,
  // https://github.com/TanStack/query/issues/4309
  // The default [de]serializer turns undefined into null, which breaks pageParam.
  serialize: superjson.stringify,
  deserialize: superjson.parse,
});

export const shouldQueryEnable = (isLoggedIn: boolean, disruptionDetected: boolean, optionEnable?: boolean) => {
  let shouldEnable = false;
  if (optionEnable !== undefined) {
    // shouldEnable = optionEnable && isLoggedIn;
    shouldEnable = optionEnable && isLoggedIn && !disruptionDetected;
  } else {
    shouldEnable = isLoggedIn && !disruptionDetected;
    // shouldEnable = isLoggedIn;
  }
  return shouldEnable;
};
