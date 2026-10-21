import {type GetNextPageParamFunction, InfiniteData, QueryKey, UseInfiniteQueryOptions} from '@tanstack/react-query';
import {AxiosError} from 'axios';

import {ErrorResponse, FezData, Paginator} from '#src/Structs/ControllerStructs';

/**
 * Tells useInfiniteQuery if there's a next page.
 */
export const getNextPageParam = (page: WithPaginator | FezData): PaginationQueryParams | undefined => {
  let paginator;
  if ('fezID' in page && page.members) {
    paginator = page.members.paginator;
  } else if ('paginator' in page) {
    paginator = page.paginator;
  }
  if (!paginator) {
    return;
  }
  const {limit, start, total} = paginator;

  const nextStart = start + limit;
  return nextStart < total ? {start: nextStart, limit: limit} : undefined;
};

/**
 * Tells useInfiniteQuery if there's a previous page.
 */
export const getPreviousPageParam = (page: WithPaginator | FezData): PaginationQueryParams | undefined => {
  let paginator;
  if ('fezID' in page && page.members) {
    paginator = page.members.paginator;
  } else if ('paginator' in page) {
    paginator = page.paginator;
  }
  if (!paginator) {
    return;
  }
  const {limit, start} = paginator;
  const prevStart = start - limit;
  return prevStart >= 0 ? {start: prevStart, limit: limit} : undefined;
};

/**
 * Type for enforcing that response types implement the paginator, or can be used
 * to implement our own client-side paginating on endpoints that may not use it.
 */
export interface WithPaginator {
  paginator: Paginator;
}

export interface PaginationQueryParams {
  start?: number;
  limit?: number;
}

/**
 * @deprecated this should no longer be needed since Swiftarr paginates all the things now.
 */
export interface PageParam extends PaginationQueryParams {
  [key: string]: unknown;
}

/**
 * Options accepted by our paginated query wrappers. Shared by the token-auth wrapper
 * (`useTokenAuthPaginationQuery`) and the optional-auth one (`useOpenPaginationQuery`),
 * since the only thing that differs between them is how `enabled` is derived.
 */
export type PaginationQueryOptionsType<
  TQueryFnData,
  TError extends Error = AxiosError<ErrorResponse>,
  TData = InfiniteData<TQueryFnData, PaginationQueryParams>,
  TQueryKey extends QueryKey = QueryKey,
> = Omit<
  UseInfiniteQueryOptions<TQueryFnData, TError, TData, TQueryKey, PaginationQueryParams>,
  'initialData' | 'queryKey' | 'onError' | 'enabled' | 'getNextPageParam' | 'initialPageParam'
> & {
  /**
   * Your query function gets a `pageParam` object containing { start?, limit? }.
   */
  // React Query v5 allows for enabled to be a function. We are disabling that
  // for now to maintain simplicity in the query wrappers.
  enabled?: boolean;
  getNextPageParam?: GetNextPageParamFunction<PaginationQueryParams, TQueryFnData>;
  initialPageParam?: PaginationQueryParams;
};
