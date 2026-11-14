import {InfiniteData} from '@tanstack/react-query';

import {QuartermasterCategory} from '#src/Enums/QuartermasterCategory';
import {
  filterItemsFromPages,
  findInPages,
  insertAtEdge,
  moveItemToEdge,
  PageItemAccessor,
  updateItemsInPages,
} from '#src/Libraries/CacheReduction';
import {QuartermasterData, QuartermasterListData} from '#src/Structs/ControllerStructs';

/**
 * Accessor for QuartermasterListData pages.
 */
export const quartermasterAccessor: PageItemAccessor<QuartermasterListData, QuartermasterData> = {
  get: page => page.items,
  set: (page, items) => ({...page, items}),
};

/**
 * The filter params `useQuartermasterListQuery` puts at `queryKey[1]` of a `/quartermaster` query.
 */
export interface QuartermasterListParams {
  category?: QuartermasterCategory;
  mine?: boolean;
  search?: string;
}

/**
 * Add `delta` to the paginator total of every page. Totals are not adjusted by the item
 * helpers in CacheReduction, so callers that add or remove an item must do it here or the
 * list's total drifts until the next refetch.
 */
export const adjustPaginatorTotal = (
  data: InfiniteData<QuartermasterListData>,
  delta: number,
): InfiniteData<QuartermasterListData> => {
  if (delta === 0) {
    return data;
  }
  return {
    ...data,
    pages: data.pages.map(page => ({
      ...page,
      paginator: {...page.paginator, total: Math.max(0, page.paginator.total + delta)},
    })),
  };
};

/**
 * Prepend newly created items to a cached list, if the list's params say they belong.
 *
 * Search lists are skipped: whether an item matches a full-text query can't be decided on
 * the client. A "mine" list accepts every item because the creator owns what they create.
 * Items already in the list are left alone so a repeated apply can't duplicate them.
 */
export const applyCreatedItems = (
  data: InfiniteData<QuartermasterListData>,
  params: QuartermasterListParams | undefined,
  items: QuartermasterData[],
): InfiniteData<QuartermasterListData> => {
  if (params?.search || data.pages.length === 0) {
    return data;
  }
  const fresh = items.filter(
    item =>
      (!params?.category || params.category === item.category) &&
      !findInPages(data, quartermasterAccessor, existing => existing.itemID === item.itemID),
  );
  if (fresh.length === 0) {
    return data;
  }
  let result = data;
  // Insert last-to-first so the batch keeps its order at the top of the list.
  for (const item of [...fresh].reverse()) {
    result = insertAtEdge(result, quartermasterAccessor, item, 'start');
  }
  return adjustPaginatorTotal(result, fresh.length);
};

/**
 * Apply an edited item to a cached list.
 *
 * - Present and still belongs: moved to the top (an edit bumps `updatedAt`, which is the sort
 *   order). In a search list it is replaced in place instead, since the position of a search
 *   hit isn't by recency alone.
 * - Present but no longer belongs (category changed): removed.
 * - Absent but belongs: prepended, except in search lists. A "mine" list only takes the item
 *   when `isOwn`, so a moderator editing someone else's item doesn't add it to their own.
 */
export const applyUpdatedItem = (
  data: InfiniteData<QuartermasterListData>,
  params: QuartermasterListParams | undefined,
  item: QuartermasterData,
  isOwn: boolean,
): InfiniteData<QuartermasterListData> => {
  const isMatch = (existing: QuartermasterData) => existing.itemID === item.itemID;
  const present = !!findInPages(data, quartermasterAccessor, isMatch);
  const belongs = (!params?.category || params.category === item.category) && (!params?.mine || isOwn);

  if (present) {
    if (!belongs) {
      return adjustPaginatorTotal(
        filterItemsFromPages(data, quartermasterAccessor, e => !isMatch(e)),
        -1,
      );
    }
    if (params?.search) {
      return updateItemsInPages(data, quartermasterAccessor, e => (isMatch(e) ? item : e));
    }
    return moveItemToEdge(data, quartermasterAccessor, isMatch, item, 'start');
  }
  if (belongs && !params?.search && data.pages.length > 0) {
    return adjustPaginatorTotal(insertAtEdge(data, quartermasterAccessor, item, 'start'), 1);
  }
  return data;
};

/**
 * Remove a deleted item from a cached list. Removal doesn't depend on the list's params:
 * the item is gone from all of them.
 */
export const applyDeletedItem = (
  data: InfiniteData<QuartermasterListData>,
  itemID: string,
): InfiniteData<QuartermasterListData> => {
  if (!findInPages(data, quartermasterAccessor, e => e.itemID === itemID)) {
    return data;
  }
  return adjustPaginatorTotal(
    filterItemsFromPages(data, quartermasterAccessor, e => e.itemID !== itemID),
    -1,
  );
};
