import {FezData, Paginator} from '#src/Structs/ControllerStructs';

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

export interface PageParam extends PaginationQueryParams {
  [key: string]: unknown;
}
