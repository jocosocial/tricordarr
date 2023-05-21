// REST API client for interacting with the Swiftarr API.
import {encode as base64_encode} from 'base-64';
import axios, {AxiosResponse} from 'axios';
import {AppSettings} from '../AppSettings';
import {Buffer} from '@craftzdog/react-native-buffer';
import {TokenStringData} from '../Structs/ControllerStructs';
import {QueryFunctionContext, QueryKey} from '@tanstack/react-query';

export async function setupAxiosStuff() {
  // https://github.com/axios/axios/issues/3870
  axios.interceptors.request.use(async config => {
    // URL
    const serverUrl = await AppSettings.SERVER_URL.getValue();
    const urlPrefix = await AppSettings.URL_PREFIX.getValue();
    if (config.url && !config.url.startsWith(`${serverUrl}${urlPrefix}`)) {
      config.url = `${serverUrl}${urlPrefix}${config.url}`;
    }
    // Authentication
    const rawTokenData = await AppSettings.TOKEN_STRING_DATA.getValue();
    if (rawTokenData && !config.headers.authorization) {
      const tokenStringData = JSON.parse(rawTokenData) as TokenStringData;
      config.headers.authorization = `Bearer ${tokenStringData.token}`;
    }
    // Other Headers
    config.headers.Accept = 'application/json';
    config.headers['X-Swiftarr-Client'] = 'Tricordarr 1.0';
    // Return
    console.info(
      `API Query: ${config.method ? config.method.toUpperCase() : 'METHOD_UNKNOWN'} ${config.url}`,
      config.params,
    );
    return config;
  });
}

/**
 * Default query function for React-Query registered in App.tsx.
 * It seems that the queryKey passed to the defaultQueryFn is of
 * type unknown instead of QueryKey as expected. -ChatGPT
 */
export const apiQueryV3 = async ({queryKey}: QueryFunctionContext<QueryKey>): Promise<AxiosResponse<any>> => {
  const mutableQueryKey = queryKey as string[];
  const {data} = await axios.get(mutableQueryKey[0]);
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
  console.log('Authentication Headers:', authHeaders);
  return authHeaders;
}

// https://stackoverflow.com/questions/41846669/download-an-image-using-axios-and-convert-it-to-base64
// https://www.npmjs.com/package/@craftzdog/react-native-buffer
// https://reactnative.dev/docs/images
export const apiQueryImageUri = async ({queryKey}: {queryKey: string | string[]}) => {
  const {data, headers} = await axios.get(queryKey[0], {
    responseType: 'arraybuffer',
  });
  const b64Data = Buffer.from(data, 'binary').toString('base64');
  const contentType = headers['Content-Type'];
  return `data:${contentType};base64,${b64Data}`;
};
