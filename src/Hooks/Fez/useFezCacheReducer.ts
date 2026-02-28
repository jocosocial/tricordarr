import {InfiniteData, useQueryClient} from '@tanstack/react-query';
import {useCallback} from 'react';

import {useCruise} from '#src/Context/Contexts/CruiseContext';
import {FezType} from '#src/Enums/FezType';
import {useTimeZone} from '#src/Hooks/useTimeZone';
import {
  filterItemsFromPages,
  findInPages,
  insertAtEdge,
  moveItemToEdge,
  PageItemAccessor,
  sortedInsertIntoPages,
  sortItemsInPages,
  updateItemsInPages,
} from '#src/Libraries/CacheReduction';
import {calcCruiseDayTime, swiftTimestampToISO} from '#src/Libraries/DateTime';
import {FezData, FezListData, FezPostData} from '#src/Structs/ControllerStructs';

const fezListAccessor: PageItemAccessor<FezListData, FezData> = {
  get: page => page.fezzes,
  set: (page, items) => ({...page, fezzes: items}),
};

const fezListKeyPrefixes = ['/fez/joined', '/fez/owner', '/fez/open', '/fez/former'];
const otherListKeyPrefixes = ['/fez/owner', '/fez/open', '/fez/former'];

const startTimeAscComparator = (a: FezData, b: FezData) => (a.startTime ?? '').localeCompare(b.startTime ?? '');

/**
 * Joined list sort: unmuted first, muted last, then lastModificationTime descending.
 * Matches the API which sorts isMuted ASC (NULL/false before true), then updatedAt DESC.
 */
const joinedSortComparator = (a: FezData, b: FezData): number => {
  const muteCompare = (a.members?.isMuted ? 1 : 0) - (b.members?.isMuted ? 1 : 0);
  if (muteCompare !== 0) return muteCompare;
  return (b.lastModificationTime ?? '').localeCompare(a.lastModificationTime ?? '');
};

/** True if the list cache (query params) is intended to contain fezzes of this type. */
function listParamsIncludeFezType(params: Record<string, unknown> | undefined, fezType: FezType): boolean {
  if (!params || typeof params !== 'object') {
    return true;
  }
  const typeParam = params.type;
  if (typeParam !== undefined) {
    const allowed = Array.isArray(typeParam) ? (typeParam as FezType[]) : [typeParam as FezType];
    if (!allowed.includes(fezType)) {
      return false;
    }
  }
  const excludeParam = params.excludetype;
  if (excludeParam !== undefined) {
    const excluded = Array.isArray(excludeParam) ? (excludeParam as FezType[]) : [excludeParam as FezType];
    if (excluded.includes(fezType)) {
      return false;
    }
  }
  const lfgOnly = params.lfgtypes;
  if (lfgOnly) {
    if (!FezType.isLFGType(fezType)) {
      return false;
    }
  }
  return true;
}

/**
 * Hook that exposes discrete actions for optimistically updating React Query
 * caches after fez mutations (Seamail, LFG, PersonalEvent). Each action calls
 * setQueryData / setQueriesData and always returns new objects so React Query
 * detects the change and triggers re-renders.
 */
export const useFezCacheReducer = () => {
  const queryClient = useQueryClient();
  const {startDate, endDate} = useCruise();
  const {tzAtTime} = useTimeZone();

  /**
   * Update a FezData entry (matched by fezID) across all four list endpoint
   * caches. The updater is only applied when the entry exists in a given cache;
   * missing entries are silently skipped.
   */
  const updateFezInAllListCaches = useCallback(
    (fezID: string, updater: (entry: FezData) => FezData) => {
      const idUpdater = (entry: FezData) => (entry.fezID === fezID ? updater(entry) : entry);
      for (const keyPrefix of fezListKeyPrefixes) {
        queryClient.setQueriesData<InfiniteData<FezListData>>({queryKey: [keyPrefix]}, oldData =>
          oldData ? updateItemsInPages(oldData, fezListAccessor, idUpdater) : oldData,
        );
      }
    },
    [queryClient],
  );

  /**
   * Like updateFezInAllListCaches but moves the updated item to the top of
   * /fez/joined (sorted by updatedAt descending). Other list caches get an
   * in-place update only. Use for mutations that change lastModificationTime.
   */
  const updateFezInListCachesWithReorder = useCallback(
    (fezID: string, updater: (entry: FezData) => FezData) => {
      const matchesFez = (f: FezData) => f.fezID === fezID;

      queryClient.setQueriesData<InfiniteData<FezListData>>({queryKey: ['/fez/joined']}, oldData => {
        if (!oldData) return oldData;
        const existing = findInPages(oldData, fezListAccessor, matchesFez);
        if (!existing) return oldData;
        return moveItemToEdge(oldData, fezListAccessor, matchesFez, updater(existing), 'start');
      });

      const idUpdater = (entry: FezData) => (entry.fezID === fezID ? updater(entry) : entry);
      for (const keyPrefix of otherListKeyPrefixes) {
        queryClient.setQueriesData<InfiniteData<FezListData>>({queryKey: [keyPrefix]}, oldData =>
          oldData ? updateItemsInPages(oldData, fezListAccessor, idUpdater) : oldData,
        );
      }
    },
    [queryClient],
  );

  /**
   * Update the FezData in the detail cache (InfiniteData<FezData> keyed by /fez/{fezID}).
   * The updater receives the first page (which is the FezData for detail queries).
   */
  const updateFezDetailCache = useCallback(
    (fezID: string, updater: (fez: FezData) => FezData) => {
      queryClient.setQueriesData<InfiniteData<FezData>>({queryKey: [`/fez/${fezID}`]}, oldData => {
        if (!oldData) {
          return oldData;
        }
        return {
          ...oldData,
          pages: oldData.pages.map(page => updater(page)),
        };
      });
    },
    [queryClient],
  );

  const computeCruiseDay = useCallback(
    (startTime: string | undefined): number | undefined => {
      if (!startTime) return undefined;
      try {
        return calcCruiseDayTime(new Date(startTime), startDate, endDate, tzAtTime).cruiseDay;
      } catch {
        return undefined;
      }
    },
    [startDate, endDate, tzAtTime],
  );

  /**
   * Handles membership transitions that require moving a fez between list endpoints
   * rather than only updating in-place.
   */
  const updateMembershipInListCaches = useCallback(
    (fezID: string, updatedFez: FezData, action?: 'join' | 'unjoin'): {removeDetail: boolean} => {
      const isMember = !!updatedFez.members;
      const isLfg = FezType.isLFGType(updatedFez.fezType);
      const isPrivateEvent = FezType.isPrivateEventType(updatedFez.fezType);
      const fezCruiseDay = computeCruiseDay(updatedFez.startTime);
      const isJoinAction = action === 'join';
      const isUnjoinAction = action === 'unjoin';

      const shouldInsertIntoQuery = (query: {queryKey: readonly unknown[]}) => {
        const params = query.queryKey[1] as Record<string, unknown> | undefined;
        const typeMatch = listParamsIncludeFezType(params, updatedFez.fezType);
        const cruiseDayParam = params?.cruiseday as number | string | undefined;
        const cruiseDayMatch =
          cruiseDayParam === undefined || fezCruiseDay === undefined || Number(cruiseDayParam) + 1 === fezCruiseDay;
        return typeMatch && cruiseDayMatch;
      };

      // LFG join: move from /fez/open to /fez/joined, preserving endpoint sort behavior.
      if (isLfg && (isJoinAction || (isMember && !isUnjoinAction))) {
        queryClient.setQueriesData<InfiniteData<FezListData>>({queryKey: ['/fez/open']}, oldData =>
          oldData ? filterItemsFromPages(oldData, fezListAccessor, entry => entry.fezID !== fezID) : oldData,
        );
        queryClient.setQueriesData<InfiniteData<FezListData>>(
          {queryKey: ['/fez/joined'], predicate: shouldInsertIntoQuery},
          oldData => {
            if (!oldData) return oldData;
            const withoutFez = filterItemsFromPages(oldData, fezListAccessor, entry => entry.fezID !== fezID);
            const inserted = insertAtEdge(withoutFez, fezListAccessor, updatedFez, 'start');
            return sortItemsInPages(inserted, fezListAccessor, joinedSortComparator);
          },
        );

        const idUpdater = (entry: FezData) => (entry.fezID === fezID ? updatedFez : entry);
        for (const keyPrefix of ['/fez/owner', '/fez/former'] as const) {
          queryClient.setQueriesData<InfiniteData<FezListData>>({queryKey: [keyPrefix]}, oldData =>
            oldData ? updateItemsInPages(oldData, fezListAccessor, idUpdater) : oldData,
          );
        }
        return {removeDetail: false};
      }

      // LFG unjoin/leave: move from /fez/joined back into /fez/open ordered by startTime.
      if (isLfg && (isUnjoinAction || !isMember)) {
        queryClient.setQueriesData<InfiniteData<FezListData>>({queryKey: ['/fez/joined']}, oldData =>
          oldData ? filterItemsFromPages(oldData, fezListAccessor, entry => entry.fezID !== fezID) : oldData,
        );
        queryClient.setQueriesData<InfiniteData<FezListData>>(
          {queryKey: ['/fez/open'], predicate: shouldInsertIntoQuery},
          oldData => {
            if (!oldData) return oldData;
            const withoutFez = filterItemsFromPages(oldData, fezListAccessor, entry => entry.fezID !== fezID);
            return sortedInsertIntoPages(withoutFez, fezListAccessor, updatedFez, startTimeAscComparator);
          },
        );

        const idUpdater = (entry: FezData) => (entry.fezID === fezID ? updatedFez : entry);
        for (const keyPrefix of ['/fez/owner', '/fez/former'] as const) {
          queryClient.setQueriesData<InfiniteData<FezListData>>({queryKey: [keyPrefix]}, oldData =>
            oldData ? updateItemsInPages(oldData, fezListAccessor, idUpdater) : oldData,
          );
        }
        return {removeDetail: false};
      }

      // Personal/private leave: remove stale entries; user no longer has membership visibility.
      if (isPrivateEvent && !isMember) {
        for (const keyPrefix of fezListKeyPrefixes) {
          queryClient.setQueriesData<InfiniteData<FezListData>>({queryKey: [keyPrefix]}, oldData =>
            oldData ? filterItemsFromPages(oldData, fezListAccessor, entry => entry.fezID !== fezID) : oldData,
          );
        }
        return {removeDetail: true};
      }

      // No transition required (e.g. participant edits, seamail membership updates).
      updateFezInListCachesWithReorder(fezID, () => updatedFez);
      return {removeDetail: false};
    },
    [computeCruiseDay, queryClient, updateFezInListCachesWithReorder],
  );

  /**
   * Remove a fez from all list caches and delete its detail cache.
   */
  const removeFezFromAllCaches = useCallback(
    (fezID: string) => {
      for (const keyPrefix of fezListKeyPrefixes) {
        queryClient.setQueriesData<InfiniteData<FezListData>>({queryKey: [keyPrefix]}, oldData =>
          oldData ? filterItemsFromPages(oldData, fezListAccessor, entry => entry.fezID !== fezID) : oldData,
        );
      }
      queryClient.removeQueries({queryKey: [`/fez/${fezID}`]});
    },
    [queryClient],
  );

  /**
   * Replace a FezData in all list and detail caches with server response data.
   * Moves the item to the top of /fez/joined and re-sorts /fez/open by startTime
   * since both fields may change on edit.
   */
  const updateFez = useCallback(
    (fezID: string, updatedFez: FezData) => {
      const matchesFez = (f: FezData) => f.fezID === fezID;

      queryClient.setQueriesData<InfiniteData<FezListData>>({queryKey: ['/fez/joined']}, oldData => {
        if (!oldData) return oldData;
        const existing = findInPages(oldData, fezListAccessor, matchesFez);
        if (!existing) return oldData;
        return moveItemToEdge(oldData, fezListAccessor, matchesFez, updatedFez, 'start');
      });

      const idUpdater = (entry: FezData) => (entry.fezID === fezID ? updatedFez : entry);
      for (const keyPrefix of ['/fez/owner', '/fez/former'] as const) {
        queryClient.setQueriesData<InfiniteData<FezListData>>({queryKey: [keyPrefix]}, oldData =>
          oldData ? updateItemsInPages(oldData, fezListAccessor, idUpdater) : oldData,
        );
      }

      updateFezDetailCache(fezID, () => updatedFez);

      queryClient.setQueriesData<InfiniteData<FezListData>>({queryKey: ['/fez/open']}, oldData => {
        if (!oldData) return oldData;
        if (!findInPages(oldData, fezListAccessor, matchesFez)) return oldData;
        const filtered = filterItemsFromPages(oldData, fezListAccessor, f => !matchesFez(f));
        return sortedInsertIntoPages(filtered, fezListAccessor, updatedFez, startTimeAscComparator);
      });

      /**
       * When a fez moves to a different cruise day (startTime changes across
       * day boundaries), day-scoped list caches need realignment: remove from
       * caches whose cruiseday no longer matches, insert into those that do.
       * All-days queries (cruiseday undefined) are left untouched.
       */
      if (
        updatedFez.startTime &&
        (FezType.isLFGType(updatedFez.fezType) || FezType.isPrivateEventType(updatedFez.fezType))
      ) {
        const fezCruiseDay = computeCruiseDay(updatedFez.startTime);

        if (fezCruiseDay !== undefined) {
          const wrongDayPredicate = (query: {queryKey: readonly unknown[]}) => {
            const params = query.queryKey[1] as Record<string, unknown> | undefined;
            const cruiseDayParam = params?.cruiseday as number | string | undefined;
            if (cruiseDayParam === undefined) return false;
            return Number(cruiseDayParam) + 1 !== fezCruiseDay;
          };
          const rightDayPredicate = (query: {queryKey: readonly unknown[]}) => {
            const params = query.queryKey[1] as Record<string, unknown> | undefined;
            const cruiseDayParam = params?.cruiseday as number | string | undefined;
            if (cruiseDayParam === undefined) return false;
            return Number(cruiseDayParam) + 1 === fezCruiseDay;
          };

          queryClient.setQueriesData<InfiniteData<FezListData>>(
            {queryKey: ['/fez/joined'], predicate: wrongDayPredicate},
            oldData => (oldData ? filterItemsFromPages(oldData, fezListAccessor, f => f.fezID !== fezID) : oldData),
          );
          queryClient.setQueriesData<InfiniteData<FezListData>>(
            {queryKey: ['/fez/joined'], predicate: rightDayPredicate},
            oldData => {
              if (!oldData) return oldData;
              if (oldData.pages.some(p => p.fezzes.some(f => f.fezID === updatedFez.fezID))) return oldData;
              return insertAtEdge(oldData, fezListAccessor, updatedFez, 'start');
            },
          );

          queryClient.setQueriesData<InfiniteData<FezListData>>(
            {queryKey: ['/fez/open'], predicate: wrongDayPredicate},
            oldData => (oldData ? filterItemsFromPages(oldData, fezListAccessor, f => f.fezID !== fezID) : oldData),
          );
          queryClient.setQueriesData<InfiniteData<FezListData>>(
            {queryKey: ['/fez/open'], predicate: rightDayPredicate},
            oldData => {
              if (!oldData) return oldData;
              if (oldData.pages.some(p => p.fezzes.some(f => f.fezID === updatedFez.fezID))) return oldData;
              return sortedInsertIntoPages(oldData, fezListAccessor, updatedFez, startTimeAscComparator);
            },
          );

          queryClient.setQueriesData<InfiniteData<FezListData>>(
            {queryKey: ['/fez/owner'], predicate: wrongDayPredicate},
            oldData => (oldData ? filterItemsFromPages(oldData, fezListAccessor, f => f.fezID !== fezID) : oldData),
          );
          queryClient.setQueriesData<InfiniteData<FezListData>>(
            {queryKey: ['/fez/owner'], predicate: rightDayPredicate},
            oldData => {
              if (!oldData) return oldData;
              if (oldData.pages.some(p => p.fezzes.some(f => f.fezID === updatedFez.fezID))) return oldData;
              return insertAtEdge(oldData, fezListAccessor, updatedFez, 'start');
            },
          );
        }
      }
    },
    [computeCruiseDay, updateFezDetailCache, queryClient],
  );

  /**
   * Insert a newly created fez into relevant list caches and seed its detail cache.
   * Seamail lists are sorted by lastModificationTime (descending) so new items prepend.
   * LFG/PersonalEvent API sort orders per endpoint:
   *   /fez/open   -> startTime ascending
   *   /fez/owner  -> createdAt descending
   *   /fez/joined -> updatedAt descending
   *   /fez/former -> createdAt descending
   * FezData lacks createdAt/updatedAt so descending lists use insertAtEdge('start').
   * When forUser is provided (e.g. 'TwitarrTeam', 'moderator'), only caches for that
   * user are updated so seamails created as a privileged user do not appear in other lists.
   */
  const createFez = useCallback(
    (fezData: FezData, forUser?: string) => {
      const normalizedForUser = forUser?.toLowerCase();
      const isSeamail = FezType.isSeamailType(fezData.fezType);

      const fezCruiseDay = computeCruiseDay(fezData.startTime);

      for (const keyPrefix of fezListKeyPrefixes) {
        queryClient.setQueriesData<InfiniteData<FezListData>>(
          {
            queryKey: [keyPrefix],
            predicate: query => {
              const params = query.queryKey[1] as Record<string, unknown> | undefined;
              const forUserMatch = (params?.foruser ?? undefined) === normalizedForUser;
              const typeMatch = listParamsIncludeFezType(params, fezData.fezType);
              const cruiseDayParam = params?.cruiseday as number | string | undefined;
              // Fez list queries (including personal events) use a 0-based "cruiseday" index
              // in query params, while calcCruiseDayTime returns a 1-based cruiseDay.
              // Align them before comparing so we only update caches for the correct day.
              const cruiseDayMatch =
                cruiseDayParam === undefined ||
                fezCruiseDay === undefined ||
                Number(cruiseDayParam) + 1 === fezCruiseDay;
              return forUserMatch && typeMatch && cruiseDayMatch;
            },
          },
          oldData => {
            if (!oldData) {
              return oldData;
            }
            const alreadyExists = oldData.pages.some(p => p.fezzes.some(f => f.fezID === fezData.fezID));
            if (alreadyExists) {
              return oldData;
            }
            if (!isSeamail && keyPrefix === '/fez/open') {
              return sortedInsertIntoPages(oldData, fezListAccessor, fezData, startTimeAscComparator);
            }
            return insertAtEdge(oldData, fezListAccessor, fezData, 'start');
          },
        );
      }
      queryClient.setQueryData<InfiniteData<FezData>>([`/fez/${fezData.fezID}`], oldData => {
        if (oldData) {
          return oldData;
        }
        return {
          pages: [fezData],
          pageParams: [undefined],
        };
      });
    },
    [queryClient, computeCruiseDay],
  );

  /**
   * Remove a fez from all caches after deletion.
   */
  const deleteFez = useCallback(
    (fezID: string) => {
      removeFezFromAllCaches(fezID);
    },
    [removeFezFromAllCaches],
  );

  /**
   * Mark a fez as cancelled across all caches.
   * The cancel mutation returns updated FezData, so replace with server response.
   */
  const cancelFez = useCallback(
    (fezID: string, updatedFez: FezData) => {
      updateFezInListCachesWithReorder(fezID, () => updatedFez);
      updateFezDetailCache(fezID, () => updatedFez);
    },
    [updateFezInListCachesWithReorder, updateFezDetailCache],
  );

  /**
   * Add a new post to the detail cache and update lastModificationTime,
   * postCount, and readCount in both list and detail caches.
   * The post mutation returns FezPostData (not the full FezData).
   * Socket payloads may send timestamp as a number: Swiftarr uses seconds since
   * 2001-01-01 (Swift Date reference). Normalize to ISO8601 string.
   */
  const appendPost = useCallback(
    (fezID: string, newPost: FezPostData) => {
      const now = new Date().toISOString();
      const rawTs = (newPost as {timestamp: string | number}).timestamp;
      const timestamp = swiftTimestampToISO(rawTs);
      const post: FezPostData = {...newPost, timestamp};

      // Add the new post only to the last page. updateFezDetailCache runs the updater on
      // every page, which would duplicate the post when fezPostsData is built from
      // data.pages.flatMap(page => page.members?.posts ?? []).
      queryClient.setQueriesData<InfiniteData<FezData>>({queryKey: [`/fez/${fezID}`]}, oldData => {
        if (!oldData?.pages.length) {
          return oldData;
        }
        const lastIndex = oldData.pages.length - 1;
        return {
          ...oldData,
          pages: oldData.pages.map((page, index) => {
            if (!page.members) {
              return page;
            }
            const isLastPage = index === lastIndex;
            const alreadyExists = page.members.posts?.some(p => p.postID === post.postID);
            const posts = isLastPage && !alreadyExists ? [...(page.members.posts ?? []), post] : page.members.posts;
            return {
              ...page,
              lastModificationTime: now,
              members: {
                ...page.members,
                postCount: page.members.postCount + 1,
                readCount: page.members.readCount + 1,
                posts,
              },
            };
          }),
        };
      });

      updateFezInListCachesWithReorder(fezID, fez => ({
        ...fez,
        lastModificationTime: now,
        members: fez.members
          ? {
              ...fez.members,
              postCount: fez.members.postCount + 1,
              readCount: fez.members.readCount + 1,
            }
          : fez.members,
      }));
    },
    [queryClient, updateFezInListCachesWithReorder],
  );

  /**
   * Replace FezData across all caches after a membership change (join, unjoin,
   * add participant, remove participant). These mutations return updated FezData.
   */
  const updateMembership = useCallback(
    (fezID: string, updatedFez: FezData, action?: 'join' | 'unjoin') => {
      const {removeDetail} = updateMembershipInListCaches(fezID, updatedFez, action);
      if (removeDetail) {
        queryClient.removeQueries({queryKey: [`/fez/${fezID}`]});
        return;
      }
      updateFezDetailCache(fezID, () => updatedFez);
    },
    [queryClient, updateMembershipInListCaches, updateFezDetailCache],
  );

  /**
   * Toggle isMuted on a fez in all caches. The mute mutation returns void,
   * so we optimistically flip the flag. Re-sorts /fez/joined: unmuted first,
   * muted last, then lastModificationTime desc to match the API.
   */
  const updateMute = useCallback(
    (fezID: string, isMuted: boolean) => {
      const muteUpdater = (fez: FezData): FezData => ({
        ...fez,
        members: fez.members ? {...fez.members, isMuted} : fez.members,
      });
      const idUpdater = (entry: FezData) => (entry.fezID === fezID ? muteUpdater(entry) : entry);

      // /fez/joined: apply mute + re-sort in a single callback
      queryClient.setQueriesData<InfiniteData<FezListData>>({queryKey: ['/fez/joined']}, oldData => {
        if (!oldData) return oldData;
        const withMute = updateItemsInPages(oldData, fezListAccessor, idUpdater);
        return sortItemsInPages(withMute, fezListAccessor, joinedSortComparator);
      });

      // Other list caches: in-place mute update only (no sort needed)
      for (const keyPrefix of otherListKeyPrefixes) {
        queryClient.setQueriesData<InfiniteData<FezListData>>({queryKey: [keyPrefix]}, oldData =>
          oldData ? updateItemsInPages(oldData, fezListAccessor, idUpdater) : oldData,
        );
      }

      updateFezDetailCache(fezID, muteUpdater);
    },
    [updateFezDetailCache, queryClient],
  );

  /**
   * Update readCount in all caches after viewing a fez. Local-only, no server call.
   * Sets readCount = postCount (fully read).
   */
  const markRead = useCallback(
    (fezID: string) => {
      const readUpdater = (fez: FezData): FezData => ({
        ...fez,
        members: fez.members ? {...fez.members, readCount: fez.members.postCount} : fez.members,
      });
      updateFezInAllListCaches(fezID, readUpdater);
      updateFezDetailCache(fezID, readUpdater);
    },
    [updateFezInAllListCaches, updateFezDetailCache],
  );

  /**
   * Invalidate a specific fez's detail cache and all list caches.
   * Use when a server-driven event (e.g. socket notification) tells us data
   * may be stale but we don't have the updated data locally.
   */
  const invalidateFez = useCallback(
    (fezID?: string) => {
      const invalidations = fezListKeyPrefixes.map(key => queryClient.invalidateQueries({queryKey: [key]}));
      if (fezID) {
        invalidations.push(queryClient.invalidateQueries({queryKey: [`/fez/${fezID}`]}));
      }
      return Promise.all(invalidations);
    },
    [queryClient],
  );

  return {
    appendPost,
    cancelFez,
    createFez,
    deleteFez,
    invalidateFez,
    markRead,
    updateFez,
    updateMembership,
    updateMute,
  };
};
