import {useCallback, useEffect, useMemo} from 'react';

import {FezType} from '#src/Enums/FezType';
import {getLfgSourcePlan, mergeLfgLists, onlyCancelledLfgs} from '#src/Libraries/LfgMerge';
import {useLfgListQuery} from '#src/Queries/Fez/FezQueries';
import {FezData} from '#src/Structs/ControllerStructs';
import {LfgListEndpoint} from '#src/Types';

interface LfgSourceQueryOptions {
  endpoint: LfgListEndpoint;
  cruiseDay?: number;
  fezType?: FezType;
  hidePast?: boolean;
  /** Joined and Owned only. Any value makes the 'all' list query joined only. */
  onlyNew?: boolean;
  /** Joined and Owned only. Any value makes the 'all' list query joined only. */
  favorite?: boolean;
  search?: string;
  /**
   * Show only cancelled LFGs. Applied on the client because Swiftarr can't filter on cancelled; it
   * makes 'all' query joined only, and loads every page of joined/owned before filtering.
   */
  cancelledOnly?: boolean;
  enabled?: boolean;
}

const queryRefetchDefaults = {refetchOnWindowFocus: 'always', refetchOnMount: 'always'} as const;

/**
 * Loads the LFG list for a source as one flat list of FezData. 'joined', 'owner' and 'former' read
 * their endpoint directly. 'all' merges /fez/open with /fez/joined on the client (see
 * mergeLfgLists), because Swiftarr has no single endpoint for both. When Favorites or Unread is
 * set, 'all' reads joined only: /fez/open has no participant data, so it can never match either.
 *
 * Every query goes through useLfgListQuery, so the cache keys are the same ones the Fez cache
 * reducer already updates for join/leave/favorite.
 */
export const useLfgSourceQuery = ({
  endpoint,
  cruiseDay,
  fezType,
  hidePast,
  onlyNew,
  favorite,
  search,
  cancelledOnly = false,
  enabled = true,
}: LfgSourceQueryOptions) => {
  const isAll = endpoint === 'all';
  const isJoined = endpoint === 'joined';
  const isDirect = endpoint === 'owner' || endpoint === 'former';
  const {openEnabled, joinedEnabled, directEnabled, loadAllJoined, loadAllDirect} = getLfgSourcePlan({
    endpoint,
    onlyNew,
    favorite,
    cancelledOnly,
    enabled,
  });

  const open = useLfgListQuery({
    endpoint: 'open',
    cruiseDay,
    fezType,
    hidePast,
    search,
    options: {...queryRefetchDefaults, enabled: openEnabled},
  });
  const joined = useLfgListQuery({
    endpoint: 'joined',
    cruiseDay,
    fezType,
    hidePast,
    onlyNew,
    favorite,
    search,
    options: {...queryRefetchDefaults, enabled: joinedEnabled},
  });
  const direct = useLfgListQuery({
    endpoint: isDirect ? endpoint : 'owner',
    cruiseDay,
    fezType,
    hidePast,
    onlyNew: endpoint === 'owner' ? onlyNew : undefined,
    favorite: endpoint === 'owner' ? favorite : undefined,
    search,
    options: {...queryRefetchDefaults, enabled: directEnabled},
  });

  const {
    hasNextPage: joinedHasNextPage,
    isFetchingNextPage: joinedIsFetchingNextPage,
    isFetchNextPageError: joinedIsFetchNextPageError,
    fetchNextPage: joinedFetchNextPage,
  } = joined;
  const {
    hasNextPage: openHasNextPage,
    isFetchingNextPage: openIsFetchingNextPage,
    isFetchNextPageError: openIsFetchNextPageError,
    fetchNextPage: openFetchNextPage,
  } = open;
  const openItemCount = open.data?.pages.reduce((count, page) => count + page.fezzes.length, 0) ?? 0;

  const {
    hasNextPage: directHasNextPage,
    isFetchingNextPage: directIsFetchingNextPage,
    isFetchNextPageError: directIsFetchNextPageError,
    fetchNextPage: directFetchNextPage,
  } = direct;

  // The merge needs every joined LFG, so page through all of them. A user's joined set is small.
  // The same goes for the client-side Cancelled filter, which can empty a server page.
  useEffect(() => {
    if (loadAllJoined && joinedHasNextPage && !joinedIsFetchingNextPage && !joinedIsFetchNextPageError) {
      void joinedFetchNextPage();
    }
  }, [loadAllJoined, joinedHasNextPage, joinedIsFetchingNextPage, joinedIsFetchNextPageError, joinedFetchNextPage]);

  useEffect(() => {
    if (loadAllDirect && directHasNextPage && !directIsFetchingNextPage && !directIsFetchNextPageError) {
      void directFetchNextPage();
    }
  }, [loadAllDirect, directHasNextPage, directIsFetchingNextPage, directIsFetchNextPageError, directFetchNextPage]);

  // /fez/open drops LFGs after paging, so a page can come back empty with more still to come. With
  // nothing loaded there is no start time to merge joined LFGs against, so keep going.
  useEffect(() => {
    if (openEnabled && openItemCount === 0 && openHasNextPage && !openIsFetchingNextPage && !openIsFetchNextPageError) {
      void openFetchNextPage();
    }
  }, [
    openEnabled,
    openItemCount,
    openHasNextPage,
    openIsFetchingNextPage,
    openIsFetchNextPageError,
    openFetchNextPage,
  ]);

  const openData = open.data;
  const joinedData = joined.data;
  const directData = direct.data;
  const fezzes = useMemo<FezData[]>(() => {
    const flatten = (data?: typeof joinedData) => data?.pages.flatMap(page => page.fezzes) ?? [];
    const list = isAll
      ? mergeLfgLists({
          joined: flatten(joinedData),
          open: flatten(openData),
          openComplete: !openEnabled || !openHasNextPage,
        })
      : flatten(isJoined ? joinedData : directData);
    return onlyCancelledLfgs(list, cancelledOnly);
  }, [isAll, isJoined, joinedData, openData, directData, openEnabled, openHasNextPage, cancelledOnly]);

  const active = isAll ? (openEnabled ? [open, joined] : [joined]) : isJoined ? [joined] : [direct];
  const isLoading =
    active.some(query => query.isLoading) ||
    (loadAllJoined && !!joinedHasNextPage) ||
    (loadAllDirect && !!directHasNextPage);
  const isError = active.some(query => query.isError);
  const isFetching = active.some(query => query.isFetching);
  const paging = isAll ? open : isJoined ? joined : direct;
  const {refetch: refetchOpen} = open;
  const {refetch: refetchJoined} = joined;
  const {refetch: refetchDirect} = direct;
  const refetch = useCallback(async () => {
    const refetches: Promise<unknown>[] = [];
    if (openEnabled) refetches.push(refetchOpen());
    if (joinedEnabled) refetches.push(refetchJoined());
    if (directEnabled) refetches.push(refetchDirect());
    await Promise.all(refetches);
  }, [openEnabled, joinedEnabled, directEnabled, refetchOpen, refetchJoined, refetchDirect]);

  return {
    fezzes,
    isLoading,
    isError,
    isFetching,
    refetch,
    fetchNextPage: paging.fetchNextPage,
    hasNextPage: paging.hasNextPage,
    isFetchingNextPage: paging.isFetchingNextPage,
  };
};
