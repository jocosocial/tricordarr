// REST API client for interacting with the Swiftarr API.
import {encode as base64_encode} from 'base-64';
import axios from 'axios';
import {AppSettings} from '../AppSettings';

export async function setupAxiosStuff() {
  // console.log('AXIOS!');
  // https://github.com/axios/axios/issues/3870
  axios.interceptors.request.use(async config => {
    console.log('Boom! Intercepted!');
    // console.log('BEFORE:', config);
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
    // console.log('AFTER:', config);
    return config;
  });
}

export const apiQueryV3 = async ({queryKey}) => {
  // const serverUrl = await AppSettings.SERVER_URL.getValue();
  // const urlPrefix = await AppSettings.URL_PREFIX.getValue();
  console.log('Performing V3 Query');
  // const url = `${serverUrl}${urlPrefix}${queryKey[0]}`;
  // console.log(url);
  const {data} = await axios.get(queryKey[0]);
  return data;
};

export async function apiQuery(endpoint, method = 'GET', headers = {}, body = undefined) {
  let serverUrl = 'https://beta.twitarr.com';
  let urlPrefix = '/api/v3';
  let apiUrlString = serverUrl + urlPrefix + endpoint;

  const defaultHeaders = {
    Accept: 'application/json',
  };

  let apiResponse;
  try {
    apiResponse = await fetch(apiUrlString, {
      method: method,
      headers: Object.assign({}, defaultHeaders, headers),
      // body: JSON.stringify(body),
    });
    // return await response.json();
  } catch (apiError) {
    // console.log("apiQuery failed:")
    // console.log(apiError)
    throw new Error('apiQuery failed:', apiError);
  }
  if (apiResponse.status >= 400) {
    let responseBody = await apiResponse.json();
    throw new Error(responseBody.reason);
  }
  return apiResponse;
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
