import React, {PropsWithChildren, useCallback, useEffect, useMemo, useState} from 'react';
import {PersistQueryClientProvider} from '@tanstack/react-query-persist-client';
import {
  apiGetProps,
  apiPostProps,
  asyncStoragePersister,
  BadResponseFormatError,
  SwiftarrQueryClient,
} from '../../../libraries/Network/APIClient';
import {SwiftarrQueryClientContext} from '../Contexts/SwiftarrQueryClientContext';
import {Query, QueryFunctionContext, QueryKey} from '@tanstack/react-query';
import {useConfig} from '../Contexts/ConfigContext';
import {useErrorHandler} from '../Contexts/ErrorHandlerContext.ts';
import axios, {AxiosResponse, isAxiosError} from 'axios';
import {ErrorResponse} from '../../../libraries/Structs/ControllerStructs.tsx';
import {useAuth} from '../Contexts/AuthContext.ts';
import DeviceInfo from 'react-native-device-info';

export const SwiftarrQueryClientProvider = ({children}: PropsWithChildren) => {
  const {appConfig, oobeCompleted} = useConfig();
  const [errorCount, setErrorCount] = useState(0);
  const {setErrorMessage} = useErrorHandler();
  const {tokenData, isLoggedIn} = useAuth();

  const ServerQueryClient = useMemo(() => {
    const client = axios.create({
      baseURL: `${appConfig.serverUrl}${appConfig.urlPrefix}`,
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
  }, [appConfig.apiClientConfig.requestTimeout, appConfig.serverUrl, appConfig.urlPrefix, isLoggedIn, tokenData]);

  const apiGet = useCallback(
    async <TData, TQueryParams>(props: apiGetProps<TQueryParams>) => {
      const response = await ServerQueryClient.get<TData, AxiosResponse<TData, TData>>(props.url, {
        params: props.queryParams,
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
    async <TBodyData, TQueryParams, TData = void>(props: apiPostProps<TBodyData, TQueryParams>) => {
      return await ServerQueryClient.post<TData, AxiosResponse<TData, TData>>(props.url, props.body, {
        params: props.queryParams,
      });
    },
    [ServerQueryClient],
  );

  /**
   * To match functionality with apiGet this should take props and not parameters.
   * However, to maintain easy compatibility I am not going to do that. So far DELETEs
   * only take a URL.
   */
  const apiDelete = useCallback(
    async <TData = void,>(url: string) => {
      return await ServerQueryClient.delete<TData, AxiosResponse<TData, TData>>(url);
    },
    [ServerQueryClient],
  );

  /**
   * Default query function for React-Query registered in App.tsx.
   * It seems that the queryKey passed to the defaultQueryFn is of
   * type unknown instead of QueryKey as expected. -ChatGPT
   * @TODO should get this deprecated? Yes.
   */
  const apiQueryV3 = useCallback(
    async ({queryKey}: QueryFunctionContext<QueryKey>): Promise<AxiosResponse<any>> => {
      const mutableQueryKey = queryKey as string[];
      const response = await apiGet<any, any>({url: mutableQueryKey[0]});
      return response.data;
    },
    [apiGet],
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
        setErrorMessage(errorString);
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
        cacheTime: appConfig.apiClientConfig.cacheTime,
        staleTime: appConfig.apiClientConfig.staleTime,
        retry: appConfig.apiClientConfig.retry,
        queryFn: apiQueryV3,
      },
    });
  }, [
    apiQueryV3,
    appConfig.apiClientConfig.cacheTime,
    appConfig.apiClientConfig.retry,
    appConfig.apiClientConfig.staleTime,
  ]);

  return (
    <SwiftarrQueryClientContext.Provider
      value={{
        errorCount,
        setErrorCount,
        disruptionDetected: disruptionDetected,
        apiGet,
        apiPost,
        apiDelete,
        ServerQueryClient,
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
