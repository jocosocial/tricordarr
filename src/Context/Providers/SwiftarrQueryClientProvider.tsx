import {Query, QueryKey} from '@tanstack/react-query';
import {PersistQueryClientProvider} from '@tanstack/react-query-persist-client';
import axios, {AxiosRequestConfig, AxiosResponse, isAxiosError} from 'axios';
import React, {PropsWithChildren, useCallback, useEffect, useMemo, useState} from 'react';
import DeviceInfo from 'react-native-device-info';

import {useAuth} from '#src/Context/Contexts/AuthContext';
import {useConfig} from '#src/Context/Contexts/ConfigContext';
import {useSnackbar} from '#src/Context/Contexts/SnackbarContext';
import {SwiftarrQueryClientContext} from '#src/Context/Contexts/SwiftarrQueryClientContext';
import {asyncStoragePersister, BadResponseFormatError, SwiftarrQueryClient} from '#src/Libraries/Network/APIClient';
import {ErrorResponse} from '#src/Structs/ControllerStructs';

export const SwiftarrQueryClientProvider = ({children}: PropsWithChildren) => {
  const {appConfig, oobeCompleted, preRegistrationMode} = useConfig();
  const [errorCount, setErrorCount] = useState(0);
  const {setSnackbarPayload} = useSnackbar();
  const {tokenData, isLoggedIn} = useAuth();
  const serverUrl = useMemo(
    () => (preRegistrationMode ? appConfig.preRegistrationServerUrl : appConfig.serverUrl),
    [appConfig.preRegistrationServerUrl, appConfig.serverUrl, preRegistrationMode],
  );

  /**
   * Establish the primary query client. Some day there may be multiple of these.
   */
  const ServerQueryClient = useMemo(() => {
    const client = axios.create({
      baseURL: `${serverUrl}${appConfig.urlPrefix}`,
      headers: {
        ...(isLoggedIn && tokenData ? {Authorization: `Bearer ${tokenData.token}`} : undefined),
        ...(isLoggedIn && tokenData ? {'X-Swiftarr-User': tokenData.userID} : undefined),
        Accept: 'application/json',
        'X-Swiftarr-Client': `${DeviceInfo.getApplicationName()} ${DeviceInfo.getVersion()}`,
        // https://www.reddit.com/r/reactnative/comments/15frmyb/is_axios_caching/
        'Cache-Control': 'no-store',
      },
      timeout: appConfig.apiClientConfig.requestTimeout,
      timeoutErrorMessage: 'Tricordarr/Axios request timeout.',
    });
    client.interceptors.request.use(async config => {
      // This logs even when the response is returned from cache.
      console.info(
        `API Query: ${config.method ? config.method.toUpperCase() : 'METHOD_UNKNOWN'} ${config.baseURL}${config.url}`,
        config.params,
      );
      return config;
    });
    return client;
  }, [appConfig.apiClientConfig.requestTimeout, serverUrl, appConfig.urlPrefix, isLoggedIn, tokenData]);

  /**
   * Raw
   */
  const PublicQueryClient = useMemo(() => {
    const client = axios.create({
      baseURL: serverUrl,
      headers: {
        'X-Swiftarr-Client': `${DeviceInfo.getApplicationName()} ${DeviceInfo.getVersion()}`,
        // https://www.reddit.com/r/reactnative/comments/15frmyb/is_axios_caching/
        'Cache-Control': 'no-store',
      },
      timeout: appConfig.apiClientConfig.requestTimeout,
      timeoutErrorMessage: 'Tricordarr/Axios request timeout.',
    });
    client.interceptors.request.use(async config => {
      // This logs even when the response is returned from cache.
      console.info(
        `Public Query: ${config.method ? config.method.toUpperCase() : 'METHOD_UNKNOWN'} ${config.baseURL}${config.url}`,
        config.params,
      );
      return config;
    });
    return client;
  }, [appConfig.apiClientConfig.requestTimeout, serverUrl]);

  /**
   * Bonus data to inject into the clients query keys.
   * Some day there may be more than one in which case this could need to be smarter.
   */
  const queryKeyExtraData: QueryKey = [serverUrl, tokenData?.userID];

  const apiGet = useCallback(
    async <TData, TQueryParams>(url: string, queryParams: TQueryParams, config?: AxiosRequestConfig) => {
      const response = await ServerQueryClient.get<TData, AxiosResponse<TData, TData>>(url, {
        params: queryParams,
        ...config,
      });

      // https://stackoverflow.com/questions/75784817/enforce-that-json-response-is-returned-with-axios
      if (!response.headers['content-type'].startsWith('application/json')) {
        throw new BadResponseFormatError(response);
      }

      return response;
    },
    [ServerQueryClient],
  );

  const apiPost = useCallback(
    async <TResponseData = void, TRequestData = void>(
      url: string,
      body?: TRequestData,
      config?: AxiosRequestConfig,
    ) => {
      return await ServerQueryClient.post<TResponseData, AxiosResponse<TResponseData, TResponseData>>(
        url,
        body,
        config,
      );
    },
    [ServerQueryClient],
  );

  const apiDelete = useCallback(
    async <TResponseData = void,>(url: string) => {
      return await ServerQueryClient.delete<TResponseData, AxiosResponse<TResponseData, TResponseData>>(url);
    },
    [ServerQueryClient],
  );

  const publicGet = useCallback(
    async <TData, TQueryParams>(url: string, queryParams: TQueryParams, config?: AxiosRequestConfig) => {
      return await PublicQueryClient.get<TData, AxiosResponse<TData, TData>>(url, {
        params: queryParams,
        ...config,
      });
    },
    [PublicQueryClient],
  );

  // https://www.benoitpaul.com/blog/react-native/offline-first-tanstack-query/
  // https://tanstack.com/query/v4/docs/react/guides/query-invalidation
  const onSuccess = () => {
    console.log('[SwiftarrQueryClientProvider.tsx] Successfully loaded query client.');
    SwiftarrQueryClient.resumePausedMutations().then(() => {
      SwiftarrQueryClient.invalidateQueries().then(() => {
        console.log('[SwiftarrQueryClientProvider.tsx] Finished resuming offline data.');
      });
    });
  };

  // Eeeek. I don't love this. But LoadingView uses AppView which is where we do the Disruption banner.
  const disruptionDetected = oobeCompleted && errorCount >= appConfig.apiClientConfig.disruptionThreshold;

  const queryCache = SwiftarrQueryClient.getQueryCache();
  queryCache.config = {
    onError: (error, query) => {
      let errorString = String(error);
      if (isAxiosError(error) && error.response) {
        try {
          const errorData = error.response.data as ErrorResponse;
          errorString += `. ${errorData.reason}`;
        } catch {
          console.warn('[SwiftarrQueryClientProvider.tsx] Unable to decode error response.');
        }
      }
      console.log('[SwiftarrQueryClientProvider.tsx] Query error encountered via', query.queryKey);
      console.log('[SwiftarrQueryClientProvider.tsx]', error);
      setErrorCount(errorCount + 1);
      if (!disruptionDetected) {
        setSnackbarPayload({message: errorString, messageType: 'error'});
      }
    },
    onSuccess: (data, query) => {
      if (errorCount !== 0) {
        // Images get cached by a different query mechanism now so this is no longer relevant.
        // Leaving the documentation here for future lolz.
        // Axios honors cache-control headers that we set on the images and will
        // return image data if we have it, which triggers the app into thinking that everything
        // is working again. This is sorta a hack unless I can figure out a way to "disable" Axios
        // caching, which doesn't feel like the right decision.
        // if (String(query.queryKey[0]).includes('/image/')) {
        //   console.log('[SwiftarrQueryClientProvider.tsx] Skipping image path because Axios is weird.');
        //   return;
        // }
        console.log('[SwiftarrQueryClientProvider.tsx] Resetting error count via', query.queryKey);
        setErrorCount(0);
      }
    },
  };

  const shouldDehydrateQuery = (query: Query) => {
    // Endpoints that should not be dehydrated (aka cached).
    const noDehydrateEndpoints = ['/client/health'];
    // The .meta is arbitrary but our convention is to use .noDehydrate=true for queries that should not be cached.
    // https://github.com/TanStack/query/discussions/3568
    return !noDehydrateEndpoints.includes(query.queryKey[0] as string) && !query.meta?.noDehydrate;
  };

  useEffect(() => {
    console.log('[SwiftarrQueryClientProvider.tsx] Configuring query client');
    const currentOptions = SwiftarrQueryClient.getDefaultOptions();
    SwiftarrQueryClient.setDefaultOptions({
      ...currentOptions,
      queries: {
        ...currentOptions.queries,
        gcTime: appConfig.apiClientConfig.cacheTime,
        staleTime: appConfig.apiClientConfig.staleTime,
        retry: appConfig.apiClientConfig.retry,
      },
    });
  }, [appConfig.apiClientConfig.cacheTime, appConfig.apiClientConfig.retry, appConfig.apiClientConfig.staleTime]);

  return (
    <SwiftarrQueryClientContext.Provider
      value={{
        queryKeyExtraData,
        errorCount,
        setErrorCount,
        disruptionDetected: disruptionDetected,
        apiGet,
        apiPost,
        apiDelete,
        ServerQueryClient,
        PublicQueryClient,
        publicGet,
        serverUrl,
      }}>
      <PersistQueryClientProvider
        client={SwiftarrQueryClient}
        persistOptions={{
          persister: asyncStoragePersister,
          dehydrateOptions: {
            shouldDehydrateQuery: shouldDehydrateQuery,
          },
          buster: appConfig.apiClientConfig.cacheBuster,
        }}
        onSuccess={onSuccess}>
        {children}
      </PersistQueryClientProvider>
    </SwiftarrQueryClientContext.Provider>
  );
};
