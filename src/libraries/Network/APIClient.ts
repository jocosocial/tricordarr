// REST API client for interacting with the Swiftarr API.
import {encode as base64_encode} from 'base-64';
import axios, {AxiosResponse} from 'axios';
import {Buffer} from '@craftzdog/react-native-buffer';
import {TokenStringData} from '../Structs/ControllerStructs';
import {QueryFunctionContext, QueryKey} from '@tanstack/react-query';
import {getAppConfig} from '../AppConfig';

/**
 * Setup function for the Axios HTTP library. We use an interceptor to automagically
 * configure various parameters of the HTTP request, from full URL to timeouts.
 */
export async function configureAxios() {
  console.log('Configuring Axios interceptors.');
  // https://github.com/axios/axios/issues/3870
  axios.interceptors.request.use(async config => {
    // URL
    const {serverUrl, urlPrefix} = await getAppConfig();
    if (config.url && !config.url.startsWith(`${serverUrl}${urlPrefix}`)) {
      config.url = `${serverUrl}${urlPrefix}${config.url}`;
    }
    // Authentication
    const rawTokenData = await TokenStringData.getLocal();
    if (rawTokenData && !config.headers.authorization) {
      const tokenStringData = JSON.parse(rawTokenData) as TokenStringData;
      config.headers.authorization = `Bearer ${tokenStringData.token}`;
    }
    // Other Headers
    config.headers.Accept = 'application/json';
    config.headers['X-Swiftarr-Client'] = 'Tricordarr 1.0';
    // Other Config
    config.timeout = 5000;
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
  // console.log('Authentication Headers:', authHeaders);
  return authHeaders;
}

// https://stackoverflow.com/questions/41846669/download-an-image-using-axios-and-convert-it-to-base64
// https://www.npmjs.com/package/@craftzdog/react-native-buffer
// https://reactnative.dev/docs/images
export const apiQueryImageUri = async ({queryKey}: {queryKey: string | string[]}) => {
  const {data, headers} = await axios.get(queryKey[0], {
    responseType: 'arraybuffer',
    headers: {
      // https://github.com/jocosocial/swiftarr/blob/e3815bb2e3c7933f7e79fbb38cbaa989372501d4/Sources/App/Controllers/ImageController.swift#L90
      // May need to figure this out better.
      'Cache-Control': 'no-cache',
    },
  });
  const b64Data = Buffer.from(data, 'binary').toString('base64');
  const contentType = headers['content-type'];
  return `data:${contentType};base64,${b64Data}`;
};

export const apiQueryImageData = async ({queryKey}: {queryKey: string | string[]}) => {
  const {data, headers} = await axios.get(queryKey[0], {
    responseType: 'arraybuffer',
    headers: {
      // https://github.com/jocosocial/swiftarr/blob/e3815bb2e3c7933f7e79fbb38cbaa989372501d4/Sources/App/Controllers/ImageController.swift#L90
      // May need to figure this out better.
      'Cache-Control': 'no-cache',
    },
  });
  const contentType = headers['content-type'];
  console.log('BAWLS', contentType);
  return {
    data: Buffer.from(data, 'binary').toString('base64'),
    contentType: contentType,
  };
};
