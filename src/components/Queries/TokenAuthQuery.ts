import {QueryFunction, QueryKey} from '@tanstack/query-core';
import {useInfiniteQuery, useQuery} from '@tanstack/react-query';
import {
  UseInfiniteQueryOptions,
  UseInfiniteQueryResult,
  UseQueryOptions,
  UseQueryResult,
} from '@tanstack/react-query/src/types';
import {useAuth} from '../Context/Contexts/AuthContext';
import {AxiosError} from 'axios';
import {ErrorResponse} from '../../libraries/Structs/ControllerStructs';

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
