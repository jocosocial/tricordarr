import {InfiniteData} from '@tanstack/react-query';

/**
 * Accessor pair for extracting and replacing a list of items within a page.
 * Used by generic cache helpers to work across different page shapes
 * (e.g. ForumSearchData vs CategoryData).
 */
export interface PageItemAccessor<TPage, TItem> {
  get: (page: TPage) => TItem[] | undefined;
  set: (page: TPage, items: TItem[]) => TPage;
}

/**
 * Map an updater function over every item across all pages.
 * Returns a new InfiniteData with new page objects where items were transformed.
 */
export const updateItemsInPages = <TPage, TItem>(
  data: InfiniteData<TPage>,
  accessor: PageItemAccessor<TPage, TItem>,
  updater: (item: TItem) => TItem,
): InfiniteData<TPage> => ({
  ...data,
  pages: data.pages.map(page => {
    const items = accessor.get(page);
    return items ? accessor.set(page, items.map(updater)) : page;
  }),
});

/**
 * Keep only items matching predicate across all pages.
 * Returns a new InfiniteData with filtered item arrays.
 */
export const filterItemsFromPages = <TPage, TItem>(
  data: InfiniteData<TPage>,
  accessor: PageItemAccessor<TPage, TItem>,
  predicate: (item: TItem) => boolean,
): InfiniteData<TPage> => ({
  ...data,
  pages: data.pages.map(page => {
    const items = accessor.get(page);
    return items ? accessor.set(page, items.filter(predicate)) : page;
  }),
});

/**
 * Find the first item matching a predicate across all pages.
 * Returns the item or undefined if not found.
 */
export const findInPages = <TPage, TItem>(
  data: InfiniteData<TPage>,
  accessor: PageItemAccessor<TPage, TItem>,
  predicate: (item: TItem) => boolean,
): TItem | undefined => {
  for (const page of data.pages) {
    const found = accessor.get(page)?.find(predicate);
    if (found) {
      return found;
    }
  }
  return undefined;
};

/**
 * Insert an item at the beginning of the first page ('start')
 * or end of the last page ('end').
 */
export const insertAtEdge = <TPage, TItem>(
  data: InfiniteData<TPage>,
  accessor: PageItemAccessor<TPage, TItem>,
  item: TItem,
  edge: 'start' | 'end',
): InfiniteData<TPage> => {
  if (data.pages.length === 0) {
    return data;
  }
  const targetIdx = edge === 'start' ? 0 : data.pages.length - 1;
  return {
    ...data,
    pages: data.pages.map((page, i) => {
      if (i !== targetIdx) {
        return page;
      }
      const items = accessor.get(page) ?? [];
      return edge === 'start' ? accessor.set(page, [item, ...items]) : accessor.set(page, [...items, item]);
    }),
  };
};

/**
 * Remove all items matching predicate from every page, then insert
 * updatedItem at the specified edge (first or last page).
 */
export const moveItemToEdge = <TPage, TItem>(
  data: InfiniteData<TPage>,
  accessor: PageItemAccessor<TPage, TItem>,
  predicate: (item: TItem) => boolean,
  updatedItem: TItem,
  edge: 'start' | 'end',
): InfiniteData<TPage> => {
  const filtered = filterItemsFromPages(data, accessor, item => !predicate(item));
  return insertAtEdge(filtered, accessor, updatedItem, edge);
};

/**
 * Insert an item in sorted position across paginated pages.
 * Walks through pages in order and inserts before the first item where
 * compareFn(newItem, existing) <= 0. If no such position is found, appends
 * to the last page.
 */
export const sortedInsertIntoPages = <TPage, TItem>(
  data: InfiniteData<TPage>,
  accessor: PageItemAccessor<TPage, TItem>,
  newItem: TItem,
  compareFn: (a: TItem, b: TItem) => number,
): InfiniteData<TPage> => {
  let inserted = false;
  const pages = data.pages.map(page => {
    if (inserted) {
      return page;
    }
    const items = accessor.get(page) ?? [];
    const index = items.findIndex(t => compareFn(newItem, t) <= 0);
    if (index !== -1) {
      inserted = true;
      return accessor.set(page, [...items.slice(0, index), newItem, ...items.slice(index)]);
    }
    return page;
  });
  if (!inserted && pages.length > 0) {
    const lastIdx = pages.length - 1;
    const lastItems = accessor.get(pages[lastIdx]) ?? [];
    pages[lastIdx] = accessor.set(pages[lastIdx], [...lastItems, newItem]);
  }
  return {...data, pages};
};

/**
 * Re-sort all items across pages: flatten, sort with compareFn, then re-split
 * using the original page sizes so InfiniteData shape is preserved.
 */
export const sortItemsInPages = <TPage, TItem>(
  data: InfiniteData<TPage>,
  accessor: PageItemAccessor<TPage, TItem>,
  compareFn: (a: TItem, b: TItem) => number,
): InfiniteData<TPage> => {
  const pageSizes = data.pages.map(page => (accessor.get(page) ?? []).length);
  const items = data.pages.flatMap(page => accessor.get(page) ?? []);
  const sorted = [...items].sort(compareFn);
  let offset = 0;
  const pages = data.pages.map((page, i) => {
    const slice = sorted.slice(offset, offset + pageSizes[i]);
    offset += pageSizes[i];
    return accessor.set(page, slice);
  });
  return {...data, pages};
};

/**
 * Compute the high-water mark (highest position reached) across all pages
 * of an InfiniteData result. Useful for determining how many items have
 * actually been fetched in a paginated query.
 */
export const paginatedHighWaterMark = <TPage>(
  data: InfiniteData<TPage>,
  getStart: (page: TPage) => number,
  getItemCount: (page: TPage) => number,
): number => {
  return data.pages.reduce((max, page) => Math.max(max, getStart(page) + getItemCount(page)), 0);
};
