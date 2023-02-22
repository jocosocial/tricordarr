// REST API client for interacting with the Swiftarr API.
import {encode as base64_encode} from 'base-64';
import axios from 'axios';
import {AppSettings} from './AppSettings';

const defaultHeaders = {
  Accept: 'application/json',
};

export const apiQueryV3 = async ({queryKey}) => {
  const serverUrl = await AppSettings.SERVER_URL.getValue();
  const urlPrefix = await AppSettings.URL_PREFIX.getValue();
  const authToken = await AppSettings.AUTH_TOKEN.getValue();
  let headers = defaultHeaders;
  if (authToken != null) {
    headers.authorization = `Bearer ${authToken}`;
  }
  const requestConfig = {
    headers: headers,
  };
  console.log('Performing V3 Query');
  console.log(headers);
  const url = `${serverUrl}${urlPrefix}${queryKey[0]}`;
  console.log(url);
  const {data} = await axios.get(url, requestConfig);
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
