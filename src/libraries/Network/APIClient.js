// REST API client for interacting with the Swiftarr API.
import {encode as base64_encode} from 'base-64';
import axios from 'axios';
import {AppSettings} from '../AppSettings';

export async function setupAxiosStuff() {
  // https://github.com/axios/axios/issues/3870
  axios.interceptors.request.use(async config => {
    // URL
    const serverUrl = await AppSettings.SERVER_URL.getValue();
    const urlPrefix = await AppSettings.URL_PREFIX.getValue();
    if (!config.url.startsWith(`${serverUrl}${urlPrefix}`)) {
      config.url = `${serverUrl}${urlPrefix}${config.url}`;
    }
    // Authentication
    const authToken = await AppSettings.AUTH_TOKEN.getValue();
    if (authToken != null && !config.headers.authorization) {
      config.headers.authorization = `Bearer ${authToken}`;
    }
    // Other Headers
    config.headers.Accept = 'application/json';
    config.headers['X-Swiftarr-Client'] = 'tricordarr';
    // Return
    console.info(`API Query: ${config.method.toUpperCase()} ${config.url}`);
    return config;
  });
}

/**
 * Default query function for React-Query registered in App.tsx.
 * @param queryKey
 * @returns {Promise<*>}
 */
export const apiQueryV3 = async ({queryKey}) => {
  const {data} = await axios.get(queryKey[0]);
  return data;
};

/**
 * Generate the HTTP headers needed to authenticate with the Twitarr API.
 * Behaves differently if given username/password or token.
 * https://stackoverflow.com/questions/246801/how-can-you-encode-a-string-to-base64-in-javascript
 * @param username  Optional String containing the username.
 * @param password  Optional String containing the password.
 * @param token     Optional String containing an OAuth2 token.
 * @returns {{authorization: string}}
 */
export function getAuthHeaders(username = undefined, password = undefined, token = undefined) {
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
  console.log('Authentication Headers:', authHeaders);
  return authHeaders;
}
