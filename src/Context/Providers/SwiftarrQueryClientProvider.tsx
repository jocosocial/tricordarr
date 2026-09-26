import {Query, QueryKey} from '@tanstack/react-query';
import {PersistQueryClientProvider} from '@tanstack/react-query-persist-client';
import axios, {AxiosRequestConfig, AxiosResponse, isAxiosError} from 'axios';
import React, {PropsWithChildren, useCallback, useEffect, useMemo, useRef, useState} from 'react';
import DeviceInfo from 'react-native-device-info';

import {useConfig} from '#src/Context/Contexts/ConfigContext';
import {useOobe} from '#src/Context/Contexts/OobeContext';
import {useSession} from '#src/Context/Contexts/SessionContext';
import {useSnackbar} from '#src/Context/Contexts/SnackbarContext';
import {SwiftarrQueryClientContext} from '#src/Context/Contexts/SwiftarrQueryClientContext';
import {createLogger} from '#src/Libraries/Logger';
import {BadResponseFormatError, createQueryClient, createSessionPersister} from '#src/Libraries/Network/APIClient';
import {isHttpClientError, shouldRetryQuery} from '#src/Libraries/Network/Retry';
import {joinUrl} from '#src/Libraries/UrlParser';
import {ErrorResponse} from '#src/Structs/ControllerStructs';

import NativeTricordarrModule from '#specs/NativeTricordarrModule';

const logger = createLogger('SwiftarrQueryClientProvider.tsx');

export const SwiftarrQueryClientProvider = ({children}: PropsWithChildren) => {
  const {appConfig} = useConfig();
  const {oobeCompleted} = useOobe();
  const {currentSession, isLoggedIn} = useSession();
  const [errorCount, setErrorCount] = useState(0);
  // TRUE while ConfigServerUrlScreen is mid-swap to a new server, before maintenance-mode
  // status is known. Suppresses the generic error Snackbar so a transient 401 from some other
  // already-mounted screen's query doesn't scare the user before the real maintenance-mode UI
  // has a chance to resolve.
  const [serverSwitchInProgress, setServerSwitchInProgress] = useState(false);
  const {setSnackbarPayload} = useSnackbar();
  const tokenData = currentSession?.tokenData || null;

  const serverUrl = useMemo(() => {
    if (!currentSession) {
      // First-launch / no session only. Not a substitute while Session is hydrating;
      // SessionProvider withholds children until load completes.
      return appConfig.serverUrl;
    }
    return currentSession.serverUrl;
  }, [currentSession, appConfig.serverUrl]);

  /**
   * Establish the primary query client. Some day there may be multiple of these.
   */
  const ServerQueryClient = useMemo(() => {
    const client = axios.create({
      baseURL: joinUrl(serverUrl, appConfig.urlPrefix),
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
      logger.info(
        `API Query: ${config.method ? config.method.toUpperCase() : 'METHOD_UNKNOWN'} ${config.baseURL}${config.url}`,
        config.params,
      );
      return config;
    });
    return client;
  }, [appConfig.apiClientConfig.requestTimeout, serverUrl, appConfig.urlPrefix, isLoggedIn, tokenData]);

  /**
   * Mirror the API base URL and token into native storage.
   *
   * Android handles the Decline button on a KrakenTalk call notification in Kotlin rather than by
   * waking a headless JS context, because declining from the lock screen has to work when the app
   * has been swiped away. That native path needs its own copy of the credentials. A no-op on iOS,
   * where CallKit delivers the decline action to the app itself.
   */
  useEffect(() => {
    if (isLoggedIn && tokenData) {
      NativeTricordarrModule.setCallCredentials(joinUrl(serverUrl, appConfig.urlPrefix), tokenData.token);
    } else {
      NativeTricordarrModule.clearCallCredentials();
    }
  }, [isLoggedIn, tokenData, serverUrl, appConfig.urlPrefix]);

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
      logger.info(
        `Public Query: ${config.method ? config.method.toUpperCase() : 'METHOD_UNKNOWN'} ${config.baseURL}${config.url}`,
        config.params,
      );
      return config;
    });
    return client;
  }, [appConfig.apiClientConfig.requestTimeout, serverUrl]);

  /**
   * Create a stable QueryClient instance that persists across session changes.
   * Use a ref to ensure the client is only created once and remains stable for hydration.
   * Session isolation is maintained via session-scoped persister and query key scoping.
   * The client itself doesn't need to be recreated per session - the persister handles isolation.
   */
  const queryClientRef = useRef<ReturnType<typeof createQueryClient> | null>(null);

  // Create the client once on mount - it will remain stable for hydration
  if (!queryClientRef.current) {
    // Create with a stable identifier - the actual session isolation is handled by the persister
    queryClientRef.current = createQueryClient('stable');
  }

  const queryClient = queryClientRef.current;

  /**
   * Create session-scoped persister for query cache isolation.
   * Update persister when session changes, but keep client stable.
   */
  const sessionPersister = useMemo(() => {
    if (!currentSession) {
      // Use a stable placeholder key - PersistQueryClientProvider will hydrate from this
      // When session loads, the key will change and trigger re-hydration via the key prop
      return createSessionPersister('__pending_session__');
    }
    return createSessionPersister(currentSession.sessionID);
  }, [currentSession]);

  // Use sessionID (or placeholder) as key to force PersistQueryClientProvider to remount
  // when session loads, ensuring it re-hydrates with the correct persister
  const persistKey = currentSession?.sessionID || '__pending_session__';

  /**
   * Bonus data to inject into the clients query keys.
   * Includes sessionID as first element to ensure proper scoping.
   */
  const queryKeyExtraData: QueryKey = useMemo(() => {
    if (!currentSession) {
      return [serverUrl, tokenData?.userID];
    }
    return [currentSession.sessionID, serverUrl, tokenData?.userID];
  }, [currentSession, serverUrl, tokenData?.userID]);

  const apiGet = useCallback(
    async <TData, TQueryParams>(url: string, queryParams: TQueryParams, config?: AxiosRequestConfig) => {
      const response = await ServerQueryClient.get<TData, AxiosResponse<TData, TData>>(url, {
        params: queryParams,
        ...config,
      });

      // https://stackoverflow.com/questions/75784817/enforce-that-json-response-is-returned-with-axios
      const contentType = response.headers['content-type'];
      if (typeof contentType !== 'string' || !contentType.startsWith('application/json')) {
        throw new BadResponseFormatError(response);
      }

      return response;
    },
    [ServerQueryClient],
  );

  // Writes get a longer timeout budget than reads. Aborting a POST that the server actually
  // processed leads the user to retry and duplicate it. Callers may still override. See #533.
  const apiPost = useCallback(
    async <TResponseData = void, TRequestData = void>(
      url: string,
      body?: TRequestData,
      config?: AxiosRequestConfig,
    ) => {
      return await ServerQueryClient.post<TResponseData, AxiosResponse<TResponseData, TResponseData>>(url, body, {
        timeout: appConfig.apiClientConfig.mutationTimeout,
        ...config,
      });
    },
    [ServerQueryClient, appConfig.apiClientConfig.mutationTimeout],
  );

  const apiDelete = useCallback(
    async <TResponseData = void,>(url: string, config?: AxiosRequestConfig) => {
      return await ServerQueryClient.delete<TResponseData, AxiosResponse<TResponseData, TResponseData>>(url, {
        timeout: appConfig.apiClientConfig.mutationTimeout,
        ...config,
      });
    },
    [ServerQueryClient, appConfig.apiClientConfig.mutationTimeout],
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

  const publicPost = useCallback(
    async <TResponseData = void, TRequestData = void>(
      url: string,
      body?: TRequestData,
      config?: AxiosRequestConfig,
    ) => {
      return await PublicQueryClient.post<TResponseData, AxiosResponse<TResponseData, TResponseData>>(url, body, {
        timeout: appConfig.apiClientConfig.mutationTimeout,
        ...config,
      });
    },
    [PublicQueryClient, appConfig.apiClientConfig.mutationTimeout],
  );

  // https://www.benoitpaul.com/blog/react-native/offline-first-tanstack-query/
  // https://tanstack.com/query/v4/docs/react/guides/query-invalidation
  const onSuccess = () => {
    if (!queryClientRef.current) return;
    logger.debug('Successfully loaded query client.');
    queryClientRef.current.resumePausedMutations().then(() => {
      queryClientRef.current?.invalidateQueries().then(() => {
        logger.debug('Finished resuming offline data.');
      });
    });
  };

  // Eeeek. I don't love this. But LoadingView uses AppView which is where we do the Disruption banner.
  const disruptionDetected = oobeCompleted && errorCount >= appConfig.apiClientConfig.disruptionThreshold;

  // Bounded fallback: if the post-swap health/client-settings check never resolves (hang,
  // backgrounded app, etc.), stop suppressing errors after a fixed window rather than staying
  // silent forever.
  useEffect(() => {
    if (!serverSwitchInProgress) return;
    const timer = setTimeout(() => {
      logger.warn('Server switch suppression window expired; resuming normal error handling.');
      setServerSwitchInProgress(false);
    }, appConfig.apiClientConfig.serverSwitchGracePeriod);
    return () => clearTimeout(timer);
  }, [serverSwitchInProgress, appConfig.apiClientConfig.serverSwitchGracePeriod]);

  // Configure query cache error/success handlers
  useEffect(() => {
    if (!queryClientRef.current) return;
    const queryCache = queryClientRef.current.getQueryCache();
    queryCache.config = {
      onError: (error, query) => {
        let errorString = String(error);
        if (isAxiosError(error) && error.response) {
          try {
            const errorData = error.response.data as ErrorResponse;
            errorString += `. ${errorData.reason}`;
          } catch {
            logger.warn('Unable to decode error response.');
          }
        }
        logger.debug('Query error encountered via', query.queryKey);
        logger.debug('Error details:', error);
        if (!isHttpClientError(error)) {
          setErrorCount(prev => prev + 1);
        }
        if (!disruptionDetected && !serverSwitchInProgress) {
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
          //   logger.debug('Skipping image path because Axios is weird.');
          //   return;
          // }
          logger.debug('Resetting error count via', query.queryKey);
          setErrorCount(0);
        }
      },
    };
  }, [disruptionDetected, serverSwitchInProgress, errorCount, setSnackbarPayload]);

  const shouldDehydrateQuery = (query: Query) => {
    // Exclude queries that have never completed a fetch - there's no data to persist.
    // A query that already has data (status 'success', possibly re-fetching in the
    // background) should still be persisted using its last-known-good data even while
    // fetchStatus is 'fetching' - react-query's hydrate() resets fetchStatus to 'idle' on
    // restore, so this is safe, and excluding it was dropping cached data (forum
    // categories/threads, seamails, etc.) whenever a background refetch on a slow/bad
    // connection was in flight at the moment the cache got persisted. See #498.
    if (query.state.status === 'pending') {
      return false;
    }

    // Endpoints that should not be dehydrated (aka cached).
    const noDehydrateEndpoints = ['/client/health'];
    // The .meta is arbitrary but our convention is to use .noDehydrate=true for queries that should not be cached.
    // https://github.com/TanStack/query/discussions/3568
    // Query key structure: [endpoint, queryParams, ...queryKeyExtraData]
    // Where queryKeyExtraData = [sessionID, serverUrl, userID]
    // So final structure: [endpoint, queryParams, sessionID, serverUrl, userID]
    const endpoint = query.queryKey[0] as string;
    const querySessionID = query.queryKey[2]; // sessionID is at index 2 after endpoint and queryParams
    const currentSessionID = currentSession?.sessionID;

    // Ensure query belongs to current session (skip check if query doesn't have sessionID - old queries)
    if (currentSessionID && querySessionID !== undefined && querySessionID !== currentSessionID) {
      return false; // Don't dehydrate queries from other sessions
    }

    return !noDehydrateEndpoints.includes(endpoint) && !query.meta?.noDehydrate;
  };

  // Track previous sessionID to detect actual session switches (not initial load)
  const previousSessionIDRef = useRef<string | null>(null);

  // Clear query cache when session changes to ensure clean state
  // Only clear when switching between two real sessions, not on initial load
  useEffect(() => {
    if (!queryClientRef.current) return; // Don't run until client is created

    const currentSessionID = currentSession?.sessionID || null;
    const previousSessionID = previousSessionIDRef.current;

    // Only clear cache when switching between two different real sessions (not initial load from null)
    if (currentSession && previousSessionID !== null && previousSessionID !== currentSessionID) {
      logger.debug('Session changed, clearing query cache');
      queryClientRef.current.clear();
    }

    // Update ref after processing
    previousSessionIDRef.current = currentSessionID;
  }, [currentSession]);

  useEffect(() => {
    if (!queryClientRef.current) return;
    logger.debug('Configuring query client');
    const currentOptions = queryClientRef.current.getDefaultOptions();
    queryClientRef.current.setDefaultOptions({
      ...currentOptions,
      queries: {
        ...currentOptions.queries,
        gcTime: appConfig.apiClientConfig.cacheTime,
        staleTime: appConfig.apiClientConfig.staleTime,
        retry: shouldRetryQuery(appConfig.apiClientConfig.retry),
      },
      mutations: {
        ...currentOptions.mutations,
        // Deliberately the opposite of the query policy above. Replaying a GET is free;
        // replaying a POST creates a second post. The server can't tell our retry apart from
        // the user tapping twice, so we never retry writes automatically. See #533.
        retry: 0,
        networkMode: 'online',
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
        serverSwitchInProgress,
        setServerSwitchInProgress,
        apiGet,
        apiPost,
        apiDelete,
        ServerQueryClient,
        PublicQueryClient,
        publicGet,
        publicPost,
        serverUrl,
      }}>
      <PersistQueryClientProvider
        key={persistKey}
        client={queryClient}
        persistOptions={{
          persister: sessionPersister,
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
