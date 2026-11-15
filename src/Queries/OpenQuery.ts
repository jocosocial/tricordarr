import {
  InfiniteData,
  useInfiniteQuery,
  UseInfiniteQueryResult,
  useQuery,
  UseQueryOptions,
  UseQueryResult,
} from '@tanstack/react-query';
import axios, {AxiosError} from 'axios';

import {useConfig} from '#src/Context/Contexts/ConfigContext';
import {useSession} from '#src/Context/Contexts/SessionContext';
import {useSwiftarrQueryClient} from '#src/Context/Contexts/SwiftarrQueryClientContext';
import {useMaintenanceGate} from '#src/Hooks/useMaintenanceBlocked';
import {getClientIdentityHeaders} from '#src/Libraries/Network/ClientHeaders';
import {joinUrl} from '#src/Libraries/UrlParser';
import {
  getNextPageParam,
  getPreviousPageParam,
  PaginationQueryOptionsType,
  PaginationQueryParams,
  WithPaginator,
} from '#src/Queries/Pagination';
import {ErrorResponse, FezData} from '#src/Structs/ControllerStructs';

/**
 * Meta for a query that reads an explicit server rather than the session's. The session's
 * QueryCache handlers leave the disruption error count alone for these, since a result from a
 * server the user is only choosing says nothing about the session's own server. Never persisted.
 */
export const EXPLICIT_SERVER_QUERY_META = {explicitServer: true, noDehydrate: true};

type ExplicitServerQueryOptions<TData, TError extends Error> = Omit<
  UseQueryOptions<TData, TError, TData>,
  'queryKey' | 'queryFn'
>;

/**
 * Shared body of the explicit-server queries. A bare request with no token, so nothing of the
 * session (its server, token or gating) is involved; disabled only until there is a server.
 * `recover` turns a thrown error into data for endpoints that answer with a body on failure.
 */
const useExplicitServerQuery = <TData, TError extends Error>(
  serverUrl: string | undefined,
  endpoint: string,
  apiPrefixed: boolean,
  options?: ExplicitServerQueryOptions<TData, TError>,
  recover?: (error: unknown) => TData,
): UseQueryResult<TData, TError> => {
  const {appConfig} = useConfig();
  return useQuery<TData, TError, TData>({
    gcTime: 0,
    ...options,
    queryKey: [endpoint, {serverUrl}],
    queryFn: async () => {
      const url = joinUrl(serverUrl, apiPrefixed ? appConfig.urlPrefix : undefined, endpoint);
      try {
        const response = await axios.get<TData>(url, {
          headers: getClientIdentityHeaders(),
          timeout: appConfig.apiClientConfig.requestTimeout,
          timeoutErrorMessage: 'Tricordarr/Axios request timeout.',
        });
        return response.data;
      } catch (error) {
        if (recover) {
          return recover(error);
        }
        throw error;
      }
    },
    meta: {...options?.meta, ...EXPLICIT_SERVER_QUERY_META},
    enabled: !!serverUrl && (options?.enabled ?? true),
  });
};

/**
 * Clone of useOpenQuery against an explicit server instead of the session's, for flows that choose
 * a server without switching to it (the setup flow before its commit). See useExplicitServerQuery.
 */
export function useExplicitOpenQuery<TData, TError extends Error = AxiosError<ErrorResponse>>(
  serverUrl: string | undefined,
  endpoint: string,
  options?: ExplicitServerQueryOptions<TData, TError>,
  recover?: (error: unknown) => TData,
): UseQueryResult<TData, TError> {
  return useExplicitServerQuery<TData, TError>(serverUrl, endpoint, true, options, recover);
}

/**
 * Clone of usePublicQuery against an explicit server instead of the session's. See
 * useExplicitOpenQuery.
 */
export function useExplicitPublicQuery<TData, TError extends Error = AxiosError<ErrorResponse>>(
  serverUrl: string | undefined,
  endpoint: string,
  options?: ExplicitServerQueryOptions<TData, TError>,
): UseQueryResult<TData, TError> {
  return useExplicitServerQuery<TData, TError>(serverUrl, endpoint, false, options);
}

/**
 * Clone of useQuery for endpoints that do not require a logged-in user.
 * Disabled while Session is hydrating and while there is no session at all (first-run setup
 * before a server has been chosen), so a request only ever goes to the session's server.
 */
export function useOpenQuery<TData, TQueryParams = Object, TError extends Error = AxiosError<ErrorResponse>>(
  endpoint: string,
  // Reminder: onError is deprecated. It's in SwiftarrQueryClientProvider.tsx instead.
  options?: Omit<UseQueryOptions<TData, TError, TData>, 'initialData' | 'queryKey'> & {
    initialData?: () => undefined;
  },
  queryParams?: TQueryParams,
): UseQueryResult<TData, TError> {
  const {isLoading, currentSession} = useSession();
  const {disruptionDetected, apiGet, queryKeyExtraData} = useSwiftarrQueryClient();
  const maintenanceGated = useMaintenanceGate(endpoint);
  // The healthcheck is how a disruption gets diagnosed and cleared, so it must keep running
  // through one. Otherwise a re-keyed health query (e.g. after a server switch) never fetches.
  const disruptionGated = disruptionDetected && endpoint !== '/client/health';
  const queryKey = [endpoint, queryParams, ...queryKeyExtraData];
  const enabled = !isLoading && !!currentSession && !disruptionGated && !maintenanceGated && (options?.enabled ?? true);

  const result = useQuery<TData, TError, TData>({
    queryKey,
    ...options,
    queryFn: options?.queryFn
      ? options.queryFn
      : async () => {
          const response = await apiGet<TData, TQueryParams>(endpoint, queryParams);
          return response.data;
        },
    enabled,
  });
  return result;
}

/**
 * Clone of useQuery for unauthenticated public (non-API-prefix) endpoints.
 * Disabled while Session is hydrating and while there is no session at all (first-run setup
 * before a server has been chosen), so a request only ever goes to the session's server.
 */
export function usePublicQuery<TData, TQueryParams = Object, TError extends Error = AxiosError<ErrorResponse>>(
  endpoint: string,
  // Reminder: onError is deprecated. It's in SwiftarrQueryClientProvider.tsx instead.
  options?: Omit<UseQueryOptions<TData, TError, TData>, 'initialData' | 'queryKey'> & {
    initialData?: () => undefined;
  },
  queryParams?: TQueryParams,
): UseQueryResult<TData, TError> {
  const {isLoading, currentSession} = useSession();
  const {disruptionDetected, publicGet, queryKeyExtraData} = useSwiftarrQueryClient();
  const queryKey = [endpoint, queryParams, ...queryKeyExtraData];
  const enabled = !isLoading && !!currentSession && !disruptionDetected && (options?.enabled ?? true);

  const result = useQuery<TData, TError, TData>({
    queryKey,
    ...options,
    queryFn: options?.queryFn
      ? options.queryFn
      : async () => {
          const response = await publicGet<TData, TQueryParams>(endpoint, queryParams);
          return response.data;
        },
    enabled,
  });
  return result;
}

/**
 * Clone of useTokenAuthPaginationQuery for paginated endpoints that swiftarr registers in an
 * optional-auth (`flexRoutes`) group -- the performer lists, for example. Those return data to a
 * logged-out client, so gating the query on `isLoggedIn` the way the token-auth wrapper does would
 * leave the screen permanently empty for pre-registration users.
 *
 * Auth is still sent when we have it (`apiGet` attaches the bearer token), which is what
 * `flexRoutes` wants: the server tailors the response to the requesting user when there is one.
 * Like `useOpenQuery`, this stays disabled while Session is hydrating so the request uses the
 * session server URL rather than a stale fallback.
 *
 * Use `useTokenAuthPaginationQuery` for anything under `tokenRoutes`.
 */
export function useOpenPaginationQuery<
  // The raw API data.
  TQueryFnData extends WithPaginator | FezData,
  // Query and pagination parameters.
  TQueryParams = PaginationQueryParams & Record<string, unknown>,
  // Data that this function returns, optionally transformed data.
  TData = InfiniteData<TQueryFnData, PaginationQueryParams>,
  // Error
  TError extends Error = AxiosError<ErrorResponse>,
>(
  endpoint: string,
  options?: PaginationQueryOptionsType<TQueryFnData, TError, TData>,
  queryParams?: TQueryParams,
): UseInfiniteQueryResult<TData, TError> {
  const {isLoading, currentSession} = useSession();
  const {disruptionDetected, apiGet, queryKeyExtraData} = useSwiftarrQueryClient();
  const {appConfig} = useConfig();
  const maintenanceGated = useMaintenanceGate(endpoint);

  const defaultQueryFn = async ({pageParam}: {pageParam: PaginationQueryParams}) => {
    const {data: responseData} = await apiGet<TQueryFnData, TQueryParams>(endpoint, {
      ...(pageParam?.limit !== undefined ? {limit: pageParam.limit} : undefined),
      ...(pageParam?.start !== undefined ? {start: pageParam.start} : undefined),
      ...queryParams,
    } as TQueryParams);
    return responseData;
  };

  return useInfiniteQuery({
    ...options,
    queryKey: [endpoint, queryParams, ...queryKeyExtraData],
    queryFn: options?.queryFn || defaultQueryFn,
    initialPageParam: {start: undefined, limit: appConfig.apiClientConfig.defaultPageSize},
    getNextPageParam: (lastPage: TQueryFnData) => getNextPageParam(lastPage),
    getPreviousPageParam: (firstPage: TQueryFnData) => getPreviousPageParam(firstPage),
    enabled: !isLoading && !!currentSession && !disruptionDetected && !maintenanceGated && (options?.enabled ?? true),
  });
}
