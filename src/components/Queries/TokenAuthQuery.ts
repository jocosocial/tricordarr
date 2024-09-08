import {QueryKey} from '@tanstack/query-core';
import {
  useInfiniteQuery,
  useQuery,
  UseInfiniteQueryOptions,
  UseQueryOptions,
  UseQueryResult,
} from '@tanstack/react-query';
import {useAuth} from '../Context/Contexts/AuthContext';
import axios, {AxiosError, AxiosResponse} from 'axios';
import {ErrorResponse, FezData} from '../../libraries/Structs/ControllerStructs';
import {getNextPageParam, getPreviousPageParam, WithPaginator} from './Pagination';
import {useSwiftarrQueryClient} from '../Context/Contexts/SwiftarrQueryClientContext';
import {shouldQueryEnable} from '../../libraries/Network/APIClient';
import {useConfig} from '../Context/Contexts/ConfigContext';

/**
 * Clone of useQuery but coded to require the user be logged in.
 * Some endpoints can be used without authentication such as the schedule.
 */
export function useTokenAuthQuery<
  TQueryFnData = unknown,
  TError extends Error = AxiosError<ErrorResponse>,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey,
>(
  options: Omit<UseQueryOptions<TQueryFnData, TError, TData, TQueryKey>, 'initialData'> & {
    initialData?: () => undefined;
  },
): UseQueryResult<TData, TError> {
  const {isLoggedIn} = useAuth();
  const {disruptionDetected} = useSwiftarrQueryClient();

  return useQuery<TQueryFnData, TError, TData, TQueryKey>({
    // Reminder: onError is deprecated. It's in SwiftarrQueryClientProvider.tsx instead.
    ...options,
    // enabled: options?.enabled !== undefined ? options.enabled && isLoggedIn : isLoggedIn,
    enabled: shouldQueryEnable(isLoggedIn, disruptionDetected, options.enabled),
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
  // TQueryFnData extends AxiosResponse<TData> = AxiosResponse<TData>,
  TQueryParams = Object,
  TError extends Error = AxiosError<ErrorResponse>,
  // TQueryKey extends QueryKey = QueryKey,
>(
  endpoint: string,
  options?: Omit<UseInfiniteQueryOptions<TData, TError, TData, TData>, 'queryKey'>,
  queryParams?: TQueryParams,
  queryKey?: QueryKey,
) {
  const {isLoggedIn} = useAuth();
  const {disruptionDetected} = useSwiftarrQueryClient();
  const {appConfig} = useConfig();

  return useInfiniteQuery<TData, TError, TData>(
    queryKey ? queryKey : [endpoint, queryParams],
    options?.queryFn
      ? options.queryFn
      : async ({pageParam = {start: undefined, limit: appConfig.apiClientConfig.defaultPageSize}}) => {
          const {data: responseData} = await axios.get<TData, AxiosResponse<TData>>(endpoint, {
            params: {
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
      // enabled: options?.enabled !== undefined ? options.enabled && isLoggedIn : isLoggedIn,
      enabled: shouldQueryEnable(isLoggedIn, disruptionDetected, options?.enabled),
    },
  );
}
