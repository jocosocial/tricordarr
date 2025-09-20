import {
  useInfiniteQuery,
  UseInfiniteQueryOptions,
  useQuery,
  UseQueryOptions,
  UseQueryResult,
} from '@tanstack/react-query';
import {AxiosError} from 'axios';

import {useAuth} from '#src/Context/Contexts/AuthContext';
import {useConfig} from '#src/Context/Contexts/ConfigContext';
import {useSwiftarrQueryClient} from '#src/Context/Contexts/SwiftarrQueryClientContext';
import {shouldQueryEnable} from '#src/Libraries/Network/APIClient';
import {
  getNextPageParam,
  getPreviousPageParam,
  PageParam,
  PaginationQueryParams,
  WithPaginator,
} from '#src/Queries/Pagination';
import {ErrorResponse, FezData} from '#src/Structs/ControllerStructs';

export type TokenAuthQueryOptionsType<TData, TError extends Error = AxiosError<ErrorResponse>> = Omit<
  UseQueryOptions<TData, TError, TData>,
  'initialData' | 'queryKey' | 'onError'
>;

/**
 * Clone of useQuery but coded to require the user be logged in.
 * Some endpoints can be used without authentication such as the schedule.
 */
export function useTokenAuthQuery<TData, TQueryParams = Object, TError extends Error = AxiosError<ErrorResponse>>(
  endpoint: string,
  // Reminder: onError is deprecated. It's in SwiftarrQueryClientProvider.tsx instead.
  options?: TokenAuthQueryOptionsType<TData, TError>,
  queryParams?: TQueryParams,
): UseQueryResult<TData, TError> {
  const {isLoggedIn} = useAuth();
  const {disruptionDetected, apiGet, queryKeyExtraData} = useSwiftarrQueryClient();

  return useQuery<TData, TError, TData>({
    queryKey: [endpoint, queryParams, ...queryKeyExtraData],
    ...options,
    queryFn: options?.queryFn
      ? options.queryFn
      : async () => {
          const response = await apiGet<TData, TQueryParams>(endpoint, queryParams);
          return response.data;
        },
    enabled: shouldQueryEnable(isLoggedIn, disruptionDetected, options?.enabled),
  });
}

/**
 * I don't know if my overrides of the TQueryFnData with TData are a good thing or not.
 * Though maybe because I'm not returning the entire query response object (TQueryFnData)
 * then maybe it's OK? This is some meta voodoo.
 * @param endpoint
 * @param options
 * @param queryParams
 */
export function useTokenAuthPaginationQuery<
  TData extends WithPaginator | FezData,
  TQueryParams extends PaginationQueryParams = PageParam,
  TError extends Error = AxiosError<ErrorResponse>,
>(
  endpoint: string,
  options?: Omit<UseInfiniteQueryOptions<TData, TError, TData, TData>, 'queryKey'>,
  queryParams?: TQueryParams,
) {
  const {isLoggedIn} = useAuth();
  const {disruptionDetected, apiGet, queryKeyExtraData} = useSwiftarrQueryClient();
  const {appConfig} = useConfig();

  return useInfiniteQuery<TData, TError, TData>(
    [endpoint, queryParams, ...queryKeyExtraData],
    options?.queryFn
      ? options.queryFn
      : async ({pageParam = {start: undefined, limit: appConfig.apiClientConfig.defaultPageSize}}) => {
          const {data: responseData} = await apiGet<TData, PageParam>(endpoint, {
            ...(pageParam.limit !== undefined ? {limit: pageParam.limit} : undefined),
            ...(pageParam.start !== undefined ? {start: pageParam.start} : undefined),
            ...queryParams,
          });
          return responseData;
        },
    {
      getNextPageParam: lastPage => getNextPageParam(lastPage),
      getPreviousPageParam: firstPage => getPreviousPageParam(firstPage),
      ...options,
      enabled: shouldQueryEnable(isLoggedIn, disruptionDetected, options?.enabled),
    },
  );
}
