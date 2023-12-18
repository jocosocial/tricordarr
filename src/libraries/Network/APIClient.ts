// REST API client for interacting with the Swiftarr API.
import {encode as base64_encode} from 'base-64';
import axios, {AxiosResponse} from 'axios';
import {Buffer} from '@craftzdog/react-native-buffer';
import {TokenStringData} from '../Structs/ControllerStructs';
import {QueryClient, QueryFunctionContext, QueryKey} from '@tanstack/react-query';
import {getAppConfig} from '../AppConfig';
import {ImageQueryData} from '../Types';
import DeviceInfo from 'react-native-device-info';
import {createAsyncStoragePersister} from '@tanstack/query-async-storage-persister';
import AsyncStorage from '@react-native-async-storage/async-storage';
import superjson from 'superjson';

/**
 * Setup function for the Axios HTTP library. We use an interceptor to automagically
 * configure various parameters of the HTTP request, from full URL to timeouts.
 */
export async function configureAxios() {
  console.log('[APIClient.ts] Configuring Axios interceptors.');
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
    config.headers['X-Swiftarr-Client'] = `${DeviceInfo.getApplicationName()} ${DeviceInfo.getVersion()}`;
    // Other Config
    config.timeout = 5000;
    config.timeoutErrorMessage = 'Tricordarr/Axios request timeout.';
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
export const apiQueryImageData = async ({queryKey}: {queryKey: string | string[]}): Promise<ImageQueryData> => {
  const {data, headers} = await axios.get(queryKey[0], {
    responseType: 'arraybuffer',
    // headers: {
    //   // https://github.com/jocosocial/swiftarr/blob/e3815bb2e3c7933f7e79fbb38cbaa989372501d4/Sources/App/Controllers/ImageController.swift#L90
    //   // May need to figure this out better.
    //   // Not having this makes Axios pretend to respond, ignoring the React Query caching?
    //   'Cache-Control': 'no-cache',
    // },
  });
  const contentType = headers['content-type'];
  const base64Data = Buffer.from(data, 'binary').toString('base64');
  const fileName = queryKey[0].split('/').pop();
  if (!fileName) {
    throw Error(`Unable to determine fileName from query: ${queryKey[0]}`);
  }
  return {
    base64: base64Data,
    mimeType: contentType,
    dataURI: `data:${contentType};base64,${base64Data}`,
    fileName: fileName,
  };
};

/**
 * React-Query Client.
 * https://tanstack.com/query/latest/docs/react/overview
 */
export const SwiftarrQueryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: apiQueryV3,
      cacheTime: 1000 * 60 * 60 * 24, // 24 hours eventually, 15 mins for now
      retry: 2,
      staleTime: 0,
    },
  },
});

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

export const shouldQueryEnable = (isLoggedIn: boolean, disruptionDetected: boolean, oobeCompleted: boolean, optionEnable?: boolean) => {
  let shouldEnable = false;
  if (optionEnable !== undefined) {
    shouldEnable = optionEnable && isLoggedIn && oobeCompleted;
    // shouldEnable = optionEnable && isLoggedIn && !disruptionDetected;
  } else {
    // shouldEnable = isLoggedIn && !disruptionDetected;
    shouldEnable = isLoggedIn && oobeCompleted;
  }
  // console.log('Query Should Enable', shouldEnable);
  return shouldEnable;
};
