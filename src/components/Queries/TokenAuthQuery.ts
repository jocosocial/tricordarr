import {QueryKey} from '@tanstack/query-core';
import {useInfiniteQuery, useQuery} from '@tanstack/react-query';
import {UseInfiniteQueryOptions, UseQueryOptions, UseQueryResult} from '@tanstack/react-query/src/types';
import {useAuth} from '../Context/Contexts/AuthContext';
import axios, {AxiosError, AxiosResponse} from 'axios';
import {ErrorResponse, FezData} from '../../libraries/Structs/ControllerStructs';
import {useErrorHandler} from '../Context/Contexts/ErrorHandlerContext';
import {getNextPageParam, getPreviousPageParam, WithPaginator} from './Pagination';
import {useSwiftarrQueryClient} from '../Context/Contexts/SwiftarrQueryClientContext';
import {shouldQueryEnable} from '../../libraries/Network/APIClient';

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
  const {setErrorMessage} = useErrorHandler();
  const {disruptionDetected} = useSwiftarrQueryClient();
  return useQuery<TQueryFnData, TError, TData, TQueryKey>({
    onError: error => {
      if (!disruptionDetected) {
        setErrorMessage(error);
      }
    },
    ...options,
    // enabled: options?.enabled !== undefined ? options.enabled && isLoggedIn : isLoggedIn,
    enabled: shouldQueryEnable(isLoggedIn, disruptionDetected, options.enabled),
  });
}

// I don't know if my overrides of the TQueryFnData with TData are a good thing or not.
// Though maybe because I'm not returning the entire query response object (TQueryFnData)
// then maybe it's OK? This is some meta voodoo.
// @TODO make this accept a queryKey not an endpoint in the options
export function useTokenAuthPaginationQuery<
  TData extends WithPaginator | FezData,
  // TQueryFnData extends AxiosResponse<TData> = AxiosResponse<TData>,
  TError extends Error = AxiosError<ErrorResponse>,
  // TQueryKey extends QueryKey = QueryKey,
>(
  endpoint: string,
  pageSize: number = 50,
  options?: Omit<UseInfiniteQueryOptions<TData, TError, TData, TData>, 'queryKey'>,
  queryParams?: Object,
) {
  const {isLoggedIn} = useAuth();
  const {setErrorMessage} = useErrorHandler();
  const {disruptionDetected} = useSwiftarrQueryClient();
  return useInfiniteQuery<TData, TError, TData>(
    [endpoint, queryParams],
    options?.queryFn
      ? options.queryFn
      : async ({pageParam = {start: undefined, limit: pageSize}}) => {
          const {data: responseData} = await axios.get<TData, AxiosResponse<TData>>(endpoint, {
            params: {
              ...(pageParam.limit ? {limit: pageParam.limit} : undefined),
              ...(pageParam.start ? {start: pageParam.start} : undefined),
              ...queryParams,
            },
          });
          return responseData;
        },
    {
      getNextPageParam: lastPage => getNextPageParam(lastPage),
      getPreviousPageParam: firstPage => getPreviousPageParam(firstPage),
      onError: error => {
        if (!disruptionDetected) {
          setErrorMessage(error);
        }
      },
      ...options,
      // enabled: options?.enabled !== undefined ? options.enabled && isLoggedIn : isLoggedIn,
      enabled: shouldQueryEnable(isLoggedIn, disruptionDetected, options?.enabled),
    },
  );
}
