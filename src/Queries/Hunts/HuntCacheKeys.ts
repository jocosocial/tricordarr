import {Query, QueryKey} from '@tanstack/react-query';

/**
 * React Query key helpers for hunts.
 *
 * Prefix-matching is per array element, not string prefix: `['/hunts']` does
 * not match `['/hunts/puzzles/:id']` or `['/hunts/:id']`. Callers must pick
 * the helper that matches the data they actually changed.
 *
 * `getAllHuntCacheKeysPredicate` exists for hunt-wide eviction (admin delete)
 * without hardcoding key literals at the call site.
 */

/**
 * Catalog list. Call-ins never change this payload.
 */
export const getHuntListCacheKeys = (): QueryKey[] => {
  return [['/hunts']];
};

/**
 * Consumer hunt detail plus the admin GET of the same hunt.
 */
export const getHuntCacheKeys = ({huntID}: {huntID?: string}): QueryKey[] => {
  if (!huntID) {
    return [];
  }
  return [[`/hunts/${huntID}`], [`/hunts/${huntID}/admin`]];
};

/**
 * Single puzzle detail.
 */
export const getHuntPuzzleCacheKeys = ({puzzleID}: {puzzleID?: string}): QueryKey[] => {
  if (!puzzleID) {
    return [];
  }
  return [[`/hunts/puzzles/${puzzleID}`]];
};

/**
 * Exact query key used by `useHuntPuzzleQuery` / `useOpenQuery`.
 */
export const getHuntPuzzleQueryKey = (puzzleID: string, extra: QueryKey): QueryKey => {
  return [`/hunts/puzzles/${puzzleID}`, undefined, ...extra];
};

/**
 * True when a cached query belongs to the hunts API surface.
 */
export const getAllHuntCacheKeysPredicate = (query: Query): boolean => {
  const first = query.queryKey[0];
  return typeof first === 'string' && first.startsWith('/hunts');
};
