import {Paginator} from '../../libraries/Structs/ControllerStructs';

/**
 * useInfiniteQuery passes a single variable back to the query function
 * with page data. That should be this information (to be used for paging)
 * or undefined to indicate there is no additional page available.
 */
export interface PaginationParams {
  start?: number;
  limit: number;
}

/**
 * Tells useInfiniteQuery if there's a next page.
 */
export const getNextPageParam = (paginator: Paginator) => {
  const {limit, start, total} = paginator;
  const nextStart = start + limit;
  return nextStart < total ? {start: nextStart, limit: limit} : undefined;
};

/**
 * Tells useInfiniteQuery if there's a previous page.
 */
export const getPreviousPageParam = (paginator: Paginator) => {
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
