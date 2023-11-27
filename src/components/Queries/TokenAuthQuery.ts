import {QueryFunction, QueryKey} from '@tanstack/query-core';
import {useInfiniteQuery, useQuery} from '@tanstack/react-query';
import {
  UseInfiniteQueryOptions,
  UseInfiniteQueryResult,
  UseQueryOptions,
  UseQueryResult,
} from '@tanstack/react-query/src/types';
import {useAuth} from '../Context/Contexts/AuthContext';
import axios, {AxiosError, AxiosRequestConfig, AxiosResponse} from 'axios';
import {ErrorResponse, FezData, ForumData, Paginator} from '../../libraries/Structs/ControllerStructs';

/**
 * Clone of useQuery but coded to require the user be logged in.
 * Some endpoints can be used without authentication such as the schedule.
 */
export function useTokenAuthQuery<
  TQueryFnData = unknown,
  TError = AxiosError<ErrorResponse>,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey,
>(
  options: Omit<UseQueryOptions<TQueryFnData, TError, TData, TQueryKey>, 'initialData'> & {
    initialData?: () => undefined;
  },
): UseQueryResult<TData, TError> {
  const {isLoggedIn} = useAuth();
  return useQuery<TQueryFnData, TError, TData, TQueryKey>({
    enabled: isLoggedIn,
    ...options,
  });
}

/**
 * Clone of useInfiniteQuery but coded to require the user be logged in.
 * Some endpoints can be used without authentication such as the schedule.
 */
export function useTokenAuthInfiniteQuery<
  TQueryFnData = unknown,
  TError = AxiosError<ErrorResponse>,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey,
>(
  queryKey: TQueryKey,
  queryFn: QueryFunction<TQueryFnData, TQueryKey>,
  options?: Omit<UseInfiniteQueryOptions<TQueryFnData, TError, TData, TQueryFnData, TQueryKey>, 'queryKey' | 'queryFn'>,
): UseInfiniteQueryResult<TData, TError> {
  const {isLoggedIn} = useAuth();
  return useInfiniteQuery<TQueryFnData, TError, TData, TQueryKey>(queryKey, queryFn, {
    enabled: isLoggedIn,
    ...options,
  });
}

interface WithPaginator {
  paginator: Paginator;
}

// @TODO deal with the type shenanigans
export function useTokenAuthPaginationQuery<
  TData extends WithPaginator,
  TQueryFnData = AxiosResponse<TData>,
  TError = AxiosError<ErrorResponse>,
  // TQueryKey extends QueryKey = QueryKey,
>(
  endpoint: string,
  pageSize: number = 50,
  options?: Omit<UseInfiniteQueryOptions<TQueryFnData, TError, TData, TQueryFnData>, 'queryKey' | 'queryFn'>,
) {
  const {isLoggedIn} = useAuth();
  return useInfiniteQuery<TData, TError, TData>(
    [endpoint],
    async ({pageParam = {start: undefined, limit: pageSize}}) => {
      const {data: responseData} = await axios.get<TData, AxiosResponse<TData>>(endpoint, {
        params: {
          limit: pageParam.limit,
          start: pageParam.start,
        },
      });
      return responseData;
    },
    {
      enabled: isLoggedIn,
      getNextPageParam: lastPage => {
        const {limit, start, total} = lastPage.paginator;
        const nextStart = start + limit;
        return nextStart < total ? {start: nextStart, limit} : undefined;
      },
      getPreviousPageParam: firstPage => {
        const {limit, start} = firstPage.paginator;
        const prevStart = start - limit;
        return prevStart >= 0 ? {start: prevStart, limit} : undefined;
      },
      ...options,
    },
  );
}
