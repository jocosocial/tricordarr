import {QueryKey} from '@tanstack/react-query';

/**
 * Key prefix shared by every Quartermastarr list query (have, need, mine, search).
 * Prefix-matching is per array element, so this does not match `/quartermaster/:id`.
 */
export const QUARTERMASTER_LIST_KEY = '/quartermaster';

/**
 * Endpoint (and so the first query-key element) of a single item's detail query.
 */
export const getQuartermasterItemEndpoint = (itemID: string): string => `/quartermaster/${itemID}`;

/**
 * Endpoint (and so the first query-key element) of a single item's moderation query.
 */
export const getQuartermasterModerationEndpoint = (itemID: string): string => `/mod/quartermaster/${itemID}`;

/**
 * React Query keys to invalidate for Quartermastarr data. Invalidation is an escape
 * hatch for rollback and desync only -- successful mutations go through
 * `useQuartermasterCacheReducer`.
 *
 * @param itemID When set, also includes that item's detail and moderation queries.
 */
export const getQuartermasterCacheKeys = ({itemID}: {itemID?: string} = {}): QueryKey[] => {
  const keys: QueryKey[] = [[QUARTERMASTER_LIST_KEY]];
  if (itemID) {
    keys.push([getQuartermasterItemEndpoint(itemID)]);
    keys.push([getQuartermasterModerationEndpoint(itemID)]);
  }
  return keys;
};
