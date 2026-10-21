import {
  InfiniteData,
  useInfiniteQuery,
  UseInfiniteQueryResult,
  useQuery,
  UseQueryOptions,
  UseQueryResult,
} from '@tanstack/react-query';
import {AxiosError} from 'axios';

import {useConfig} from '#src/Context/Contexts/ConfigContext';
import {useSession} from '#src/Context/Contexts/SessionContext';
import {useSwiftarrQueryClient} from '#src/Context/Contexts/SwiftarrQueryClientContext';
import {
  getNextPageParam,
  getPreviousPageParam,
  PaginationQueryOptionsType,
  PaginationQueryParams,
  WithPaginator,
} from '#src/Queries/Pagination';
import {ErrorResponse, FezData} from '#src/Structs/ControllerStructs';

/**
 * Clone of useQuery for endpoints that do not require a logged-in user.
 * Disabled while Session is hydrating so the request uses the session server URL
 * (or the first-launch AppConfig default) rather than a stale fallback.
 */
export function useOpenQuery<TData, TQueryParams = Object, TError extends Error = AxiosError<ErrorResponse>>(
  endpoint: string,
  // Reminder: onError is deprecated. It's in SwiftarrQueryClientProvider.tsx instead.
  options?: Omit<UseQueryOptions<TData, TError, TData>, 'initialData' | 'queryKey'> & {
    initialData?: () => undefined;
  },
  queryParams?: TQueryParams,
): UseQueryResult<TData, TError> {
  const {isLoading} = useSession();
  const {disruptionDetected, apiGet, queryKeyExtraData} = useSwiftarrQueryClient();
  const queryKey = [endpoint, queryParams, ...queryKeyExtraData];
  const enabled = !isLoading && !disruptionDetected && (options?.enabled ?? true);

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
 * Disabled while Session is hydrating so the request uses the session server URL
 * (or the first-launch AppConfig default) rather than a stale fallback.
 */
export function usePublicQuery<TData, TQueryParams = Object, TError extends Error = AxiosError<ErrorResponse>>(
  endpoint: string,
  // Reminder: onError is deprecated. It's in SwiftarrQueryClientProvider.tsx instead.
  options?: Omit<UseQueryOptions<TData, TError, TData>, 'initialData' | 'queryKey'> & {
    initialData?: () => undefined;
  },
  queryParams?: TQueryParams,
): UseQueryResult<TData, TError> {
  const {isLoading} = useSession();
  const {disruptionDetected, publicGet, queryKeyExtraData} = useSwiftarrQueryClient();
  const queryKey = [endpoint, queryParams, ...queryKeyExtraData];
  const enabled = !isLoading && !disruptionDetected && (options?.enabled ?? true);

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
  const {isLoading} = useSession();
  const {disruptionDetected, apiGet, queryKeyExtraData} = useSwiftarrQueryClient();
  const {appConfig} = useConfig();

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
    enabled: !isLoading && !disruptionDetected && (options?.enabled ?? true),
  });
}
