import {InfiniteData, useQueryClient} from '@tanstack/react-query';
import {useCallback} from 'react';

import {useSession} from '#src/Context/Contexts/SessionContext';
import {isQuartermasterItemOwner} from '#src/Libraries/Quartermaster/QuartermasterAccess';
import {
  applyCreatedItems,
  applyDeletedItem,
  applyUpdatedItem,
  QuartermasterListParams,
} from '#src/Libraries/Quartermaster/QuartermasterCacheReduction';
import {getQuartermasterItemEndpoint, QUARTERMASTER_LIST_KEY} from '#src/Queries/Quartermaster/QuartermasterCacheKeys';
import {QuartermasterData, QuartermasterListData} from '#src/Structs/ControllerStructs';

/**
 * Hook that exposes discrete actions for updating React Query caches after Quartermastarr
 * mutations. No local state -- just named functions that transform the cache.
 *
 * Each cached `/quartermaster` list is judged on its own `queryKey[1]` params (category, mine,
 * search); see `QuartermasterCacheReduction` for the per-list rules. Detail caches are patched
 * by key prefix, which tolerates the extra key elements the query wrappers append.
 */
export const useQuartermasterCacheReducer = () => {
  const queryClient = useQueryClient();
  const {currentUserID} = useSession();

  /**
   * Prepend newly created items to every list cache they belong in.
   * @param items The items returned by the create endpoint.
   */
  const createItems = useCallback(
    (items: QuartermasterData[]) => {
      queryClient.cancelQueries({queryKey: [QUARTERMASTER_LIST_KEY]});
      for (const query of queryClient.getQueryCache().findAll({queryKey: [QUARTERMASTER_LIST_KEY]})) {
        const params = query.queryKey[1] as QuartermasterListParams | undefined;
        queryClient.setQueryData<InfiniteData<QuartermasterListData>>(query.queryKey, oldData =>
          oldData ? applyCreatedItems(oldData, params, items) : oldData,
        );
      }
    },
    [queryClient],
  );

  /**
   * Apply an edited item to the detail cache and every list cache.
   * @param item The item returned by the update endpoint (always includes the owner).
   */
  const updateItem = useCallback(
    (item: QuartermasterData) => {
      queryClient.cancelQueries({queryKey: [QUARTERMASTER_LIST_KEY]});
      queryClient.setQueriesData<QuartermasterData>({queryKey: [getQuartermasterItemEndpoint(item.itemID)]}, oldData =>
        oldData ? item : oldData,
      );
      const isOwn = isQuartermasterItemOwner(item, currentUserID);
      for (const query of queryClient.getQueryCache().findAll({queryKey: [QUARTERMASTER_LIST_KEY]})) {
        const params = query.queryKey[1] as QuartermasterListParams | undefined;
        queryClient.setQueryData<InfiniteData<QuartermasterListData>>(query.queryKey, oldData =>
          oldData ? applyUpdatedItem(oldData, params, item, isOwn) : oldData,
        );
      }
    },
    [queryClient, currentUserID],
  );

  /**
   * Remove a deleted item from every list cache and drop its detail cache.
   * @param itemID The ID of the deleted item.
   */
  const deleteItem = useCallback(
    (itemID: string) => {
      queryClient.cancelQueries({queryKey: [QUARTERMASTER_LIST_KEY]});
      queryClient.setQueriesData<InfiniteData<QuartermasterListData>>({queryKey: [QUARTERMASTER_LIST_KEY]}, oldData =>
        oldData ? applyDeletedItem(oldData, itemID) : oldData,
      );
      queryClient.removeQueries({queryKey: [getQuartermasterItemEndpoint(itemID)]});
    },
    [queryClient],
  );

  return {createItems, updateItem, deleteItem};
};
