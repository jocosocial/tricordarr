import {QueryKey} from '@tanstack/react-query';

/**
 * React Query key helpers for hunts.
 *
 * Prefix-matching is per array element, not string prefix: `['/hunts']` does
 * not match `['/hunts/puzzles/:id']` or `['/hunts/:id']`. Callers must pick
 * the helper that matches the data they actually changed.
 */

/**
 * Consumer hunt detail. Call-ins can change solved-puzzle answers on this payload.
 */
export const getHuntCacheKeys = ({huntID}: {huntID?: string}): QueryKey[] => {
  if (!huntID) {
    return [];
  }
  return [[`/hunts/${huntID}`]];
};

/**
 * Single puzzle detail, including the current user's call-in history.
 */
export const getHuntPuzzleCacheKeys = ({puzzleID}: {puzzleID?: string}): QueryKey[] => {
  if (!puzzleID) {
    return [];
  }
  return [[`/hunts/puzzles/${puzzleID}`]];
};
