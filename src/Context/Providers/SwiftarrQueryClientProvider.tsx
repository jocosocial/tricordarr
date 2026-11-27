import {Query, QueryKey} from '@tanstack/react-query';
import {PersistQueryClientProvider} from '@tanstack/react-query-persist-client';
import axios, {AxiosRequestConfig, AxiosResponse, isAxiosError} from 'axios';
import React, {PropsWithChildren, useCallback, useEffect, useMemo, useState} from 'react';

import {useConfig} from '#src/Context/Contexts/ConfigContext';
import {useOobe} from '#src/Context/Contexts/OobeContext';
import {useSession} from '#src/Context/Contexts/SessionContext';
import {useSnackbar} from '#src/Context/Contexts/SnackbarContext';
import {SwiftarrQueryClientContext} from '#src/Context/Contexts/SwiftarrQueryClientContext';
import {useServerUrl} from '#src/Hooks/useServerUrl';
import {createLogger} from '#src/Libraries/Logger';
import {navigateToLogin} from '#src/Libraries/Navigation';
import {BadResponseFormatError, createQueryClient, createSessionPersister} from '#src/Libraries/Network/APIClient';
import {getApiClientHeaders, getClientIdentityHeaders} from '#src/Libraries/Network/ClientHeaders';
import {isHttpClientError, shouldRetryQuery} from '#src/Libraries/Network/Retry';
import {joinUrl} from '#src/Libraries/UrlParser';
import {ErrorResponse} from '#src/Structs/ControllerStructs';

const logger = createLogger('SwiftarrQueryClientProvider.tsx');

/**
 * The session's API clients, QueryClient and persisted cache.
 *
 * Mounted under SessionBoundaryProvider, which remounts it on every session change, so everything here lives
 * and dies with exactly one session: the QueryClient is created once per mount, the axios pair is
 * built from that session's account token and server, and the cache file is that session's.
 * Cache reducers still match on `queryKeyExtraData` so they stay correct even if two clients ever
 * share a cache.
 */
export const SwiftarrQueryClientProvider = ({children}: PropsWithChildren) => {
  const {appConfig} = useConfig();
  const {oobeCompleted} = useOobe();
  const {currentSession, currentAccount, currentToken, isLoggedIn, markAccountRevoked} = useSession();
  const [errorCount, setErrorCount] = useState(0);
  // TRUE while ConfigServerUrlScreen is mid-swap to a new server, before maintenance-mode
  // status is known. Suppresses the generic error Snackbar so a transient 401 from some other
  // already-mounted screen's query doesn't scare the user before the real maintenance-mode UI
  // has a chance to resolve.
  const [serverSwitchInProgress, setServerSwitchInProgress] = useState(false);
  const {setSnackbarPayload} = useSnackbar();
  const tokenData = currentToken;

  const serverUrl = useServerUrl();

  /**
   * Establish the primary query client. Some day there may be multiple of these.
   */
  const ServerQueryClient = useMemo(() => {
    const client = axios.create({
      baseURL: joinUrl(serverUrl, appConfig.urlPrefix),
      headers: {
        ...(isLoggedIn && tokenData ? {Authorization: `Bearer ${tokenData.token}`} : undefined),
        ...(isLoggedIn && tokenData ? {'X-Swiftarr-User': tokenData.userID} : undefined),
        ...getApiClientHeaders(),
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
   * Raw
   */
  const PublicQueryClient = useMemo(() => {
    const client = axios.create({
      baseURL: serverUrl,
      headers: getClientIdentityHeaders(),
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
   * One QueryClient per mount, and SessionBoundaryProvider mounts once per session. Bluesky throws if the key
   * changes while mounted; a mismatch here would mean a cache mixing two sessions, so it is logged
   * as an error instead of being allowed to pass silently.
   */
  const [mountedSessionID] = useState(currentSession?.sessionID ?? null);
  const [queryClient] = useState(() => createQueryClient(currentSession?.sessionID ?? 'none'));
  useEffect(() => {
    if ((currentSession?.sessionID ?? null) !== mountedSessionID) {
      logger.error(
        'Session changed without a SessionBoundaryProvider remount.',
        mountedSessionID,
        currentSession?.sessionID,
      );
    }
  }, [currentSession?.sessionID, mountedSessionID]);

  /**
   * Session-scoped persister for this session's query cache file.
   */
  const sessionPersister = useMemo(
    () => createSessionPersister(mountedSessionID ?? '__pending_session__'),
    [mountedSessionID],
  );

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
    logger.debug('Successfully loaded query client.');
    queryClient
      .resumePausedMutations()
      .then(() => queryClient.invalidateQueries())
      .then(() => {
        logger.debug('Finished resuming offline data.');
      })
      .catch(error => logger.error('Failed to resume offline data', error));
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
    const queryCache = queryClient.getQueryCache();
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
        // An explicit-server query (setup flow) reads some other server, so it says nothing about
        // whether this session's server is disrupted.
        if (!isHttpClientError(error) && !query.meta?.explicitServer) {
          setErrorCount(prev => prev + 1);
        }
        // A request that was already in flight when client settings revealed maintenance mode lands
        // here late. MaintenanceModeView already explains it, so don't also show an error.
        const isMaintenanceResponse =
          isAxiosError(error) && error.response?.status === 401 && /maintenance mode/i.test(errorString);
        // A 401 on a request that carried this session's token means the server no longer honors the
        // token (typically a "log out all devices" from elsewhere deleted the shared token). Revoke
        // just this account; the revoke is guarded by sessionID so a late 401 can't hit another.
        const sentToken = isAxiosError(error) ? String(error.config?.headers?.Authorization ?? '') : '';
        const isRevokedToken =
          isAxiosError(error) &&
          error.response?.status === 401 &&
          !isMaintenanceResponse &&
          !!currentAccount &&
          !!currentToken &&
          !!currentSession &&
          sentToken === `Bearer ${currentToken.token}`;
        if (isRevokedToken) {
          const label = currentAccount.username || 'your account';
          markAccountRevoked(currentAccount.accountID, currentSession.sessionID).catch(err =>
            logger.error('Failed to mark account revoked:', err),
          );
          setSnackbarPayload({
            message: `Your session for ${label} was signed out. Tap to sign in again.`,
            messageType: 'error',
            action: {
              label: 'Sign In',
              onPress: () => navigateToLogin({serverUrl: currentAccount.serverUrl, username: currentAccount.username}),
            },
          });
          return;
        }
        if (!disruptionDetected && !serverSwitchInProgress && !isMaintenanceResponse) {
          setSnackbarPayload({message: errorString, messageType: 'error'});
        }
      },
      onSuccess: (data, query) => {
        // Likewise, another server answering must not clear this session's disruption.
        if (errorCount !== 0 && !query.meta?.explicitServer) {
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
  }, [
    queryClient,
    disruptionDetected,
    serverSwitchInProgress,
    errorCount,
    setSnackbarPayload,
    currentAccount,
    currentToken,
    currentSession,
    markAccountRevoked,
  ]);

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

  useEffect(() => {
    logger.debug('Configuring query client');
    const currentOptions = queryClient.getDefaultOptions();
    queryClient.setDefaultOptions({
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
  }, [
    queryClient,
    appConfig.apiClientConfig.cacheTime,
    appConfig.apiClientConfig.retry,
    appConfig.apiClientConfig.staleTime,
  ]);

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
