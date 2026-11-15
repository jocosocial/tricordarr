import axios from 'axios';

import {getAuthHeaders} from '#src/Libraries/Network/APIClient';
import {getApiClientHeaders} from '#src/Libraries/Network/ClientHeaders';
import {joinUrl} from '#src/Libraries/UrlParser';
import {
  CreatedUserData,
  CurrentUserData,
  TokenStringData,
  UserCreateData,
  UserHeader,
  UserRecoveryData,
  UserUsernameLookupData,
} from '#src/Structs/ControllerStructs';

/**
 * Calls against an explicit server, independent of the active session's API client. Logging in
 * to a server (add account, OOBE) and reading whoami for a token that is not yet stored both have
 * to work before any session points at that server.
 */

/**
 * POST /auth/login on the given server with basic credentials.
 */
export const loginToServer = async (
  serverUrl: string,
  urlPrefix: string,
  username: string,
  password: string,
  timeout: number,
) => {
  return await axios.post<TokenStringData>(joinUrl(joinUrl(serverUrl, urlPrefix), '/auth/login'), undefined, {
    headers: {...getApiClientHeaders(), ...getAuthHeaders(username, password)},
    timeout,
  });
};

/**
 * GET /user/whoami on the given server with a bearer token.
 */
export const fetchWhoami = async (serverUrl: string, urlPrefix: string, token: string, timeout: number) => {
  const response = await axios.get<CurrentUserData>(joinUrl(joinUrl(serverUrl, urlPrefix), '/user/whoami'), {
    headers: {...getApiClientHeaders(), ...getAuthHeaders(undefined, undefined, token)},
    timeout,
  });
  return response.data;
};

/**
 * POST /user/create on the given server (unauthenticated). Used to register on a server chosen in
 * the add-account flow, which no session may point at yet.
 */
export const createUserOnServer = async (
  serverUrl: string,
  urlPrefix: string,
  data: UserCreateData,
  timeout: number,
) => {
  return await axios.post<CreatedUserData>(joinUrl(joinUrl(serverUrl, urlPrefix), '/user/create'), data, {
    headers: getApiClientHeaders(),
    timeout,
  });
};

/**
 * POST /auth/recovery on the given server (unauthenticated): set a new password using a recovery
 * key, registration code or the old password.
 */
export const recoverAccountOnServer = async (
  serverUrl: string,
  urlPrefix: string,
  data: UserRecoveryData,
  timeout: number,
) => {
  return await axios.post<TokenStringData>(joinUrl(joinUrl(serverUrl, urlPrefix), '/auth/recovery'), data, {
    headers: getApiClientHeaders(),
    timeout,
  });
};

/**
 * POST /auth/username on the given server (unauthenticated): find an account's username from its
 * registration code plus the password or recovery key.
 */
export const lookupUsernameOnServer = async (
  serverUrl: string,
  urlPrefix: string,
  data: UserUsernameLookupData,
  timeout: number,
) => {
  return await axios.post<UserHeader>(joinUrl(joinUrl(serverUrl, urlPrefix), '/auth/username'), data, {
    headers: getApiClientHeaders(),
    timeout,
  });
};
