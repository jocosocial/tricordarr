import {InfiniteData, useQueryClient} from '@tanstack/react-query';
import {useCallback} from 'react';

import {FezType} from '#src/Enums/FezType';
import {
  filterItemsFromPages,
  insertAtEdge,
  PageItemAccessor,
  sortedInsertIntoPages,
  updateItemsInPages,
} from '#src/Libraries/CacheReduction';
import {FezData, FezListData, FezPostData} from '#src/Structs/ControllerStructs';

const fezListAccessor: PageItemAccessor<FezListData, FezData> = {
  get: page => page.fezzes,
  set: (page, items) => ({...page, fezzes: items}),
};

const fezListKeyPrefixes = ['/fez/joined', '/fez/owner', '/fez/open', '/fez/former'];

const startTimeAscComparator = (a: FezData, b: FezData) => (a.startTime ?? '').localeCompare(b.startTime ?? '');

/**
 * Hook that exposes discrete actions for optimistically updating React Query
 * caches after fez mutations (Seamail, LFG, PersonalEvent). Each action calls
 * setQueryData / setQueriesData and always returns new objects so React Query
 * detects the change and triggers re-renders.
 */
export const useFezCacheReducer = () => {
  const queryClient = useQueryClient();

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
   * Use after edit/update mutations that return the full FezData.
   */
  const updateFez = useCallback(
    (fezID: string, updatedFez: FezData) => {
      updateFezInAllListCaches(fezID, () => updatedFez);
      updateFezDetailCache(fezID, () => updatedFez);
    },
    [updateFezInAllListCaches, updateFezDetailCache],
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
   */
  const createFez = useCallback(
    (fezData: FezData) => {
      const isSeamail = FezType.isSeamailType(fezData.fezType);
      for (const keyPrefix of fezListKeyPrefixes) {
        queryClient.setQueriesData<InfiniteData<FezListData>>({queryKey: [keyPrefix]}, oldData => {
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
        });
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
    [queryClient],
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
      updateFezInAllListCaches(fezID, () => updatedFez);
      updateFezDetailCache(fezID, () => updatedFez);
    },
    [updateFezInAllListCaches, updateFezDetailCache],
  );

  /**
   * Add a new post to the detail cache and update lastModificationTime,
   * postCount, and readCount in both list and detail caches.
   * The post mutation returns FezPostData (not the full FezData).
   */
  const appendPost = useCallback(
    (fezID: string, newPost: FezPostData) => {
      const now = new Date().toISOString();

      updateFezDetailCache(fezID, fez => {
        if (!fez.members) {
          return fez;
        }
        const alreadyExists = fez.members.posts?.some(p => p.postID === newPost.postID);
        if (alreadyExists) {
          return fez;
        }
        return {
          ...fez,
          lastModificationTime: now,
          members: {
            ...fez.members,
            postCount: fez.members.postCount + 1,
            readCount: fez.members.readCount + 1,
            posts: [...(fez.members.posts ?? []), newPost],
          },
        };
      });

      updateFezInAllListCaches(fezID, fez => ({
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
    [updateFezDetailCache, updateFezInAllListCaches],
  );

  /**
   * Replace FezData across all caches after a membership change (join, unjoin,
   * add participant, remove participant). These mutations return updated FezData.
   */
  const updateMembership = useCallback(
    (fezID: string, updatedFez: FezData) => {
      updateFezInAllListCaches(fezID, () => updatedFez);
      updateFezDetailCache(fezID, () => updatedFez);
    },
    [updateFezInAllListCaches, updateFezDetailCache],
  );

  /**
   * Toggle isMuted on a fez in all caches. The mute mutation returns void,
   * so we optimistically flip the flag.
   */
  const updateMute = useCallback(
    (fezID: string, isMuted: boolean) => {
      const muteUpdater = (fez: FezData): FezData => ({
        ...fez,
        members: fez.members ? {...fez.members, isMuted} : fez.members,
      });
      updateFezInAllListCaches(fezID, muteUpdater);
      updateFezDetailCache(fezID, muteUpdater);
    },
    [updateFezInAllListCaches, updateFezDetailCache],
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
