import {InfiniteData, useQueryClient} from '@tanstack/react-query';
import {useCallback} from 'react';

import {useSwiftarrQueryClient} from '#src/Context/Contexts/SwiftarrQueryClientContext';
import {useEventCacheReducer} from '#src/Hooks/Events/useEventCacheReducer';
import {
  filterItemsFromPages,
  findInPages,
  PageItemAccessor,
  sortedInsertIntoPages,
} from '#src/Libraries/CacheReduction';
import {PerformerData, PerformerHeaderData, PerformerResponseData} from '#src/Structs/ControllerStructs';

/** Accessor for PerformerResponseData pages (performers is required). */
const performerListAccessor: PageItemAccessor<PerformerResponseData, PerformerHeaderData> = {
  get: page => page.performers,
  set: (page, items) => ({...page, performers: items}),
};

/** Ascending comparator matching the server's alphabetical-by-name list order. */
const byNameComparator = (a: PerformerHeaderData, b: PerformerHeaderData) => a.name.localeCompare(b.name);

const listKeyForHeader = (header: PerformerHeaderData) =>
  header.isOfficialPerformer ? '/performer/official' : '/performer/shadow';

/**
 * Hook that exposes discrete actions for optimistically updating React Query
 * caches after performer mutations (self-service create/edit/delete of a
 * Shadow Event Organizer's performer profile). Each action calls
 * setQueryData / setQueriesData and always returns new objects so React
 * Query detects the change and triggers re-renders.
 */
export const usePerformerCacheReducer = () => {
  const queryClient = useQueryClient();
  const {queryKeyExtraData} = useSwiftarrQueryClient();
  const {removePerformerFromEvent, upsertPerformerInEvent} = useEventCacheReducer();

  const performerDetailQueryKey = useCallback(
    (performerID: string) => [`/performer/${performerID}`, undefined, ...queryKeyExtraData],
    [queryKeyExtraData],
  );

  const performerSelfQueryKey = useCallback(
    () => ['/performer/self', undefined, ...queryKeyExtraData],
    [queryKeyExtraData],
  );

  /**
   * Seed the `/performer/self` cache and (when the performer has an id, i.e.
   * it's not a brand-new never-fetched-by-id record) the `/performer/{id}`
   * cache with a complete PerformerData the caller already has in hand
   * (typically the response of a create/update mutation).
   */
  const setPerformerDetail = useCallback(
    (performer: PerformerData) => {
      queryClient.setQueryData<PerformerData>(performerSelfQueryKey(), performer);
      if (performer.header.id) {
        queryClient.setQueryData<PerformerData>(performerDetailQueryKey(performer.header.id), performer);
      }
    },
    [queryClient, performerSelfQueryKey, performerDetailQueryKey],
  );

  /** Evict the `/performer/self` and `/performer/{performerID}` detail caches. */
  const removePerformerDetail = useCallback(
    (performerID: string | undefined) => {
      queryClient.removeQueries({queryKey: performerSelfQueryKey()});
      if (performerID) {
        queryClient.removeQueries({queryKey: performerDetailQueryKey(performerID)});
      }
    },
    [queryClient, performerSelfQueryKey, performerDetailQueryKey],
  );

  /**
   * Insert (or find-update-reinsert) a performer header in sorted position in
   * the official or shadow list cache matching `header.isOfficialPerformer`.
   */
  const upsertPerformerInLists = useCallback(
    (header: PerformerHeaderData) => {
      const listKey = listKeyForHeader(header);
      for (const query of queryClient.getQueryCache().findAll({queryKey: [listKey]})) {
        queryClient.setQueryData<InfiniteData<PerformerResponseData>>(query.queryKey, oldData => {
          if (!oldData) {
            return oldData;
          }
          const existing = findInPages(oldData, performerListAccessor, p => p.id === header.id);
          const withoutExisting = existing
            ? filterItemsFromPages(oldData, performerListAccessor, p => p.id !== header.id)
            : oldData;
          return sortedInsertIntoPages(withoutExisting, performerListAccessor, header, byNameComparator);
        });
      }
    },
    [queryClient],
  );

  /** Remove a performer (by id) from both the official and shadow list caches. */
  const removePerformerFromLists = useCallback(
    (performerID: string | undefined) => {
      if (!performerID) {
        return;
      }
      for (const listKey of ['/performer/official', '/performer/shadow']) {
        queryClient.setQueriesData<InfiniteData<PerformerResponseData>>({queryKey: [listKey]}, oldData =>
          oldData ? filterItemsFromPages(oldData, performerListAccessor, p => p.id !== performerID) : oldData,
        );
      }
    },
    [queryClient],
  );

  /**
   * Apply a create/update mutation's response everywhere a performer can be
   * cached: its own detail entries, the official/shadow list it belongs to,
   * and the `performers` array of every event it's attached to. Consolidated
   * here so callers can't apply the response to some caches but not others.
   */
  const upsertPerformer = useCallback(
    (performer: PerformerData) => {
      setPerformerDetail(performer);
      upsertPerformerInLists(performer.header);
      performer.events.forEach(event => upsertPerformerInEvent(event.eventID, performer.header));
    },
    [setPerformerDetail, upsertPerformerInLists, upsertPerformerInEvent],
  );

  /**
   * Remove a deleted performer everywhere it can be cached: its own detail
   * entries, the official/shadow list it belonged to, and the `performers`
   * array of every event it was attached to. Consolidated here so callers
   * can't forget one of the caches the delete implicitly affects.
   */
  const deletePerformer = useCallback(
    (performer: PerformerData) => {
      removePerformerDetail(performer.header.id);
      removePerformerFromLists(performer.header.id);
      performer.events.forEach(event => removePerformerFromEvent(event.eventID, performer.header.id));
    },
    [removePerformerDetail, removePerformerFromLists, removePerformerFromEvent],
  );

  return {
    deletePerformer,
    upsertPerformer,
  };
};
