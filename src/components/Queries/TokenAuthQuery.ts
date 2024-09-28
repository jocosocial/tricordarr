import {QueryKey} from '@tanstack/query-core';
import {
  useInfiniteQuery,
  useQuery,
  UseInfiniteQueryOptions,
  UseQueryOptions,
  UseQueryResult,
} from '@tanstack/react-query';
import {useAuth} from '../Context/Contexts/AuthContext';
import {AxiosError} from 'axios';
import {ErrorResponse, FezData} from '../../libraries/Structs/ControllerStructs';
import {getNextPageParam, getPreviousPageParam, PageParam, PaginationQueryParams, WithPaginator} from './Pagination';
import {useSwiftarrQueryClient} from '../Context/Contexts/SwiftarrQueryClientContext';
import {apiGet, shouldQueryEnable} from '../../libraries/Network/APIClient';
import {useConfig} from '../Context/Contexts/ConfigContext';

/**
 * Clone of useQuery but coded to require the user be logged in.
 * Some endpoints can be used without authentication such as the schedule.
 */
export function useTokenAuthQuery<
  TData,
  TQueryParams = Object,
  TError extends Error = AxiosError<ErrorResponse>,
  TQueryKey extends QueryKey = QueryKey,
>(
  endpoint: string,
  // Reminder: onError is deprecated. It's in SwiftarrQueryClientProvider.tsx instead.
  options?: Omit<UseQueryOptions<TData, TError, TData>, 'initialData' | 'queryKey' | 'onError'>,
  queryParams?: TQueryParams,
  queryKey?: TQueryKey,
): UseQueryResult<TData, TError> {
  const {isLoggedIn} = useAuth();
  const {disruptionDetected} = useSwiftarrQueryClient();

  return useQuery<TData, TError, TData>({
    queryKey: queryKey ? queryKey : [endpoint, queryParams],
    ...options,
    queryFn: options?.queryFn
      ? options.queryFn
      : async () => {
          const response = await apiGet<TData, TQueryParams>({url: endpoint, queryParams: queryParams});
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
 * @param queryKey Override the default queryKey. Use with caution.
 */
export function useTokenAuthPaginationQuery<
  TData extends WithPaginator | FezData,
  TQueryParams extends PaginationQueryParams = PageParam,
  TError extends Error = AxiosError<ErrorResponse>,
  TQueryKey extends QueryKey = QueryKey,
>(
  endpoint: string,
  options?: Omit<UseInfiniteQueryOptions<TData, TError, TData, TData>, 'queryKey'>,
  queryParams?: TQueryParams,
  queryKey?: TQueryKey,
) {
  const {isLoggedIn} = useAuth();
  const {disruptionDetected} = useSwiftarrQueryClient();
  const {appConfig} = useConfig();

  return useInfiniteQuery<TData, TError, TData>(
    queryKey ? queryKey : [endpoint, queryParams],
    options?.queryFn
      ? options.queryFn
      : async ({pageParam = {start: undefined, limit: appConfig.apiClientConfig.defaultPageSize}}) => {
          const {data: responseData} = await apiGet<TData, PageParam>({
            url: endpoint,
            queryParams: {
              ...(pageParam.limit !== undefined ? {limit: pageParam.limit} : undefined),
              ...(pageParam.start !== undefined ? {start: pageParam.start} : undefined),
              ...queryParams,
            },
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
