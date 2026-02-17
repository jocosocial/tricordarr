import {InfiniteData, useQueryClient} from '@tanstack/react-query';
import {useCallback} from 'react';

import {useConfig} from '#src/Context/Contexts/ConfigContext';
import {ForumSort, ForumSortDirection} from '#src/Enums/ForumSortFilter';
import {
  filterItemsFromPages,
  insertAtEdge,
  moveItemToEdge,
  PageItemAccessor,
  sortedInsertIntoPages,
  updateItemsInPages,
} from '#src/Libraries/CacheReduction';
import {
  CategoryData,
  ForumData,
  ForumListData,
  ForumSearchData,
  PostData,
  PostSearchData,
  UserHeader,
} from '#src/Structs/ControllerStructs';

/**
 * Query key prefixes for forum list caches that contain ForumSearchData
 * (each has `forumThreads: ForumListData[]`).
 */
const forumSearchDataKeys: string[] = [
  '/forum/search',
  '/forum/favorites',
  '/forum/mutes',
  '/forum/unread',
  '/forum/owner',
  '/forum/recent',
];

/** Accessor for ForumSearchData pages (forumThreads is required). */
const forumSearchAccessor: PageItemAccessor<ForumSearchData, ForumListData> = {
  get: page => page.forumThreads,
  set: (page, items) => ({...page, forumThreads: items}),
};

/** Accessor for CategoryData pages (forumThreads is optional). */
const categoryAccessor: PageItemAccessor<CategoryData, ForumListData> = {
  get: page => page.forumThreads,
  set: (page, items) => ({...page, forumThreads: items}),
};

/**
 * Updates a ForumListData entry in-place-style (returns new object) when
 * it matches the given forumID.
 */
const updateForumListEntry = (
  entry: ForumListData,
  forumID: string,
  authorHeader: UserHeader,
  newPost: PostData,
): ForumListData => {
  if (entry.forumID !== forumID) {
    return entry;
  }
  return {
    ...entry,
    postCount: entry.postCount + 1,
    readCount: entry.readCount + 1,
    lastPoster: authorHeader,
    lastPostAt: newPost.createdAt,
  };
};

/**
 * Build ForumListData from the first page of a thread cache (ForumData).
 * Used when prepending a thread to the recent list that wasn't already in that cache.
 */
const forumListDataFromForumData = (page: ForumData): ForumListData => {
  const posts = page.posts;
  const firstPost = posts[0];
  const lastPost = posts[posts.length - 1];
  const postCount = page.paginator?.total ?? posts.length;
  return {
    forumID: page.forumID,
    creator: page.creator,
    title: page.title,
    postCount,
    readCount: postCount,
    createdAt: firstPost?.createdAt ?? new Date().toISOString(),
    lastPoster: lastPost?.author ?? page.creator,
    lastPostAt: lastPost?.createdAt,
    isLocked: page.isLocked,
    isFavorite: page.isFavorite,
    isMuted: page.isMuted,
    isPinned: page.isPinned,
  };
};

/**
 * Returns the API's default sort for an endpoint when no explicit sort param is provided.
 */
const getApiDefaultSort = (endpoint: string, isEventCategory?: boolean): ForumSort => {
  if (endpoint.startsWith('/forum/categories/')) {
    return isEventCategory ? ForumSort.event : ForumSort.update;
  }
  switch (endpoint) {
    case '/forum/owner':
      return ForumSort.title;
    case '/forum/favorites':
    case '/forum/mutes':
    case '/forum/recent':
    case '/forum/unread':
      return ForumSort.update;
    default:
      return ForumSort.title;
  }
};

/**
 * Returns the effective sort direction. When userDirection is undefined,
 * falls back to the API default: ascending for title/event, descending for update/create.
 */
const getEffectiveDirection = (sort: ForumSort, userDirection?: ForumSortDirection): ForumSortDirection => {
  if (userDirection) {
    return userDirection;
  }
  switch (sort) {
    case ForumSort.title:
    case ForumSort.event:
      return ForumSortDirection.ascending;
    default:
      return ForumSortDirection.descending;
  }
};

/**
 * Ascending comparator for two ForumListData entries based on a ForumSort field.
 */
const compareForumListData = (a: ForumListData, b: ForumListData, sort: ForumSort): number => {
  switch (sort) {
    case ForumSort.title:
      return a.title.localeCompare(b.title);
    case ForumSort.update:
      return (a.lastPostAt ?? '').localeCompare(b.lastPostAt ?? '');
    case ForumSort.create:
      return a.createdAt.localeCompare(b.createdAt);
    case ForumSort.event: {
      const cmp = (a.eventTime ?? '').localeCompare(b.eventTime ?? '');
      if (cmp !== 0) return cmp;
      return a.title.localeCompare(b.title);
    }
  }
};

/**
 * Comparator for category forum lists. Applies the API's priority sorts
 * (isMuted descending, isPinned descending) before the field-level sort with direction.
 */
const compareCategoryForumListData = (
  a: ForumListData,
  b: ForumListData,
  sort: ForumSort,
  direction: ForumSortDirection,
): number => {
  const mutedA = a.isMuted ? 1 : 0;
  const mutedB = b.isMuted ? 1 : 0;
  if (mutedA !== mutedB) {
    return mutedB - mutedA;
  }
  const pinnedA = a.isPinned ? 1 : 0;
  const pinnedB = b.isPinned ? 1 : 0;
  if (pinnedA !== pinnedB) {
    return pinnedB - pinnedA;
  }
  const cmp = compareForumListData(a, b, sort);
  return direction === ForumSortDirection.ascending ? cmp : -cmp;
};

/**
 * Build a directional comparator from a base ascending sort and a direction.
 */
const buildDirectionalComparator = (
  sort: ForumSort,
  direction: ForumSortDirection,
): ((a: ForumListData, b: ForumListData) => number) => {
  return (a, b) => {
    const cmp = compareForumListData(a, b, sort);
    return direction === ForumSortDirection.ascending ? cmp : -cmp;
  };
};

/**
 * Extract effective sort and direction from a query's key params with user-preference defaults.
 */
const extractSortParams = (
  queryKey: readonly unknown[],
  endpoint: string,
  defaults: {sort?: ForumSort; direction?: ForumSortDirection},
  isEventCategory?: boolean,
): {sort: ForumSort; direction: ForumSortDirection} => {
  const params = queryKey[1] as Record<string, string> | undefined;
  const sort = (params?.sort as ForumSort) ?? defaults.sort ?? getApiDefaultSort(endpoint, isEventCategory);
  const direction = getEffectiveDirection(sort, (params?.order as ForumSortDirection) ?? defaults.direction);
  return {sort, direction};
};

/**
 * Hook that exposes discrete actions for optimistically updating React Query
 * caches after forum mutations. Each action calls `setQueryData` /
 * `setQueriesData` and always returns new objects so React Query detects the
 * change and triggers re-renders.
 *
 * No local state, no useReducer -- just named functions that transform the cache.
 */
export const useForumCacheReducer = () => {
  const queryClient = useQueryClient();
  const {appConfig} = useConfig();
  const {defaultForumSortOrder, defaultForumSortDirection} = appConfig.userPreferences;

  /**
   * Search all forum list caches (ForumSearchData, CategoryData, thread detail)
   * for a ForumListData entry matching forumID. Optionally exclude a key prefix.
   */
  const findForumListEntry = useCallback(
    (forumID: string, categoryID: string | undefined, excludeKey?: string): ForumListData | undefined => {
      for (const keyPrefix of forumSearchDataKeys) {
        if (keyPrefix === excludeKey) {
          continue;
        }
        for (const [, data] of queryClient.getQueriesData<InfiniteData<ForumSearchData>>({queryKey: [keyPrefix]})) {
          for (const page of data?.pages ?? []) {
            const entry = page.forumThreads.find(t => t.forumID === forumID);
            if (entry) {
              return entry;
            }
          }
        }
      }
      if (categoryID) {
        for (const [, data] of queryClient.getQueriesData<InfiniteData<CategoryData>>({
          queryKey: [`/forum/categories/${categoryID}`],
        })) {
          for (const page of data?.pages ?? []) {
            const entry = page.forumThreads?.find(t => t.forumID === forumID);
            if (entry) {
              return entry;
            }
          }
        }
      }
      const threadEntries = queryClient.getQueriesData<InfiniteData<ForumData>>({queryKey: [`/forum/${forumID}`]});
      const firstPage = threadEntries[0]?.[1]?.pages?.[0];
      if (firstPage) {
        return forumListDataFromForumData(firstPage);
      }
      return undefined;
    },
    [queryClient],
  );

  /**
   * Update a ForumListData entry (matched by forumID) across all ForumSearchData
   * list caches and the CategoryData cache for the given category.
   * Optionally exclude certain key prefixes (e.g. when handling them separately).
   */
  const updateForumListInAllCaches = useCallback(
    (
      forumID: string,
      categoryID: string | undefined,
      updater: (entry: ForumListData) => ForumListData,
      excludeKeyPrefixes?: string[],
    ) => {
      const idUpdater = (entry: ForumListData) => (entry.forumID === forumID ? updater(entry) : entry);
      const excludeSet = excludeKeyPrefixes ? new Set(excludeKeyPrefixes) : undefined;
      for (const keyPrefix of forumSearchDataKeys) {
        if (excludeSet?.has(keyPrefix)) {
          continue;
        }
        queryClient.setQueriesData<InfiniteData<ForumSearchData>>({queryKey: [keyPrefix]}, oldData =>
          oldData ? updateItemsInPages(oldData, forumSearchAccessor, idUpdater) : oldData,
        );
      }
      if (categoryID) {
        queryClient.setQueriesData<InfiniteData<CategoryData>>(
          {queryKey: [`/forum/categories/${categoryID}`]},
          oldData => (oldData ? updateItemsInPages(oldData, categoryAccessor, idUpdater) : oldData),
        );
      }
    },
    [queryClient],
  );

  /**
   * Update the ForumData in the thread detail cache (InfiniteData<ForumData>).
   */
  const updateForumThreadCache = useCallback(
    (forumID: string, updater: (page: ForumData, index: number, pages: ForumData[]) => ForumData) => {
      queryClient.setQueriesData<InfiniteData<ForumData>>({queryKey: [`/forum/${forumID}`]}, oldData => {
        if (!oldData) {
          return oldData;
        }
        return {
          ...oldData,
          pages: oldData.pages.map(updater),
        };
      });
    },
    [queryClient],
  );

  /**
   * Append a newly created post to the thread cache and update all forum
   * list caches with the new post count / last poster info.
   */
  const appendPost = useCallback(
    (forumID: string, categoryID: string, newPost: PostData, authorHeader: UserHeader) => {
      updateForumThreadCache(forumID, (page, i, pages) => {
        if (i !== pages.length - 1) {
          return page;
        }
        if (page.posts.some(p => p.postID === newPost.postID)) {
          return page;
        }
        return {
          ...page,
          posts: [...page.posts, newPost],
        };
      });
      updateForumListInAllCaches(forumID, categoryID, entry =>
        updateForumListEntry(entry, forumID, authorHeader, newPost),
      );
    },
    [updateForumThreadCache, updateForumListInAllCaches],
  );

  /**
   * Mark a forum as fully read in all list caches. Local-only, no server call.
   * When the update was not a no-op (readCount differed from postCount), the
   * thread is moved to the top of the recent list.
   */
  const markRead = useCallback(
    (forumID: string, categoryID?: string) => {
      const updater = (entry: ForumListData) => ({...entry, readCount: entry.postCount});
      updateForumListInAllCaches(forumID, categoryID, updater, ['/forum/recent']);

      const matchesForum = (t: ForumListData) => t.forumID === forumID;

      for (const query of queryClient.getQueryCache().findAll({queryKey: ['/forum/recent']})) {
        const params = query.queryKey[1] as Record<string, string> | undefined;
        const recentDirection = getEffectiveDirection(
          ForumSort.update,
          (params?.order as ForumSortDirection) ?? defaultForumSortDirection,
        );
        const edge = recentDirection === ForumSortDirection.descending ? 'start' : 'end';

        queryClient.setQueryData<InfiniteData<ForumSearchData>>(query.queryKey, oldData => {
          if (!oldData) {
            return oldData;
          }

          let foundEntry: ForumListData | undefined;
          for (const page of oldData.pages) {
            foundEntry = page.forumThreads.find(matchesForum);
            if (foundEntry) {
              break;
            }
          }

          if (!foundEntry) {
            const threadCacheEntries = queryClient.getQueriesData<InfiniteData<ForumData>>({
              queryKey: [`/forum/${forumID}`],
            });
            const firstPage = threadCacheEntries[0]?.[1]?.pages?.[0];
            if (firstPage) {
              return insertAtEdge(oldData, forumSearchAccessor, forumListDataFromForumData(firstPage), edge);
            }
            return oldData;
          }

          const updatedEntry = {...foundEntry, readCount: foundEntry.postCount};
          if (foundEntry.readCount === foundEntry.postCount) {
            return updateItemsInPages(oldData, forumSearchAccessor, t => (matchesForum(t) ? updatedEntry : t));
          }
          return moveItemToEdge(oldData, forumSearchAccessor, matchesForum, updatedEntry, edge);
        });
      }
    },
    [queryClient, updateForumListInAllCaches, defaultForumSortDirection],
  );

  /**
   * Toggle a boolean field (isFavorite or isMuted) for a forum across all caches.
   * When toggling on, the entry is inserted into the target list cache in sorted order.
   * When toggling off, the entry is removed from the target list cache.
   */
  const updateToggleListCache = useCallback(
    (
      forumID: string,
      categoryID: string | undefined,
      newValue: boolean,
      field: 'isFavorite' | 'isMuted',
      targetKeyPrefix: string,
    ) => {
      if (newValue) {
        updateForumListInAllCaches(forumID, categoryID, entry => ({...entry, [field]: true}), [targetKeyPrefix]);

        const foundEntry = findForumListEntry(forumID, categoryID, targetKeyPrefix);
        if (foundEntry) {
          const updatedEntry: ForumListData = {...foundEntry, [field]: true};
          for (const query of queryClient.getQueryCache().findAll({queryKey: [targetKeyPrefix]})) {
            const {sort, direction} = extractSortParams(query.queryKey, targetKeyPrefix, {
              sort: defaultForumSortOrder,
              direction: defaultForumSortDirection,
            });
            const compareFn = buildDirectionalComparator(sort, direction);
            queryClient.setQueryData<InfiniteData<ForumSearchData>>(query.queryKey, oldData => {
              if (!oldData) {
                return oldData;
              }
              const alreadyExists = oldData.pages.some(p => p.forumThreads.some(t => t.forumID === forumID));
              if (alreadyExists) {
                return updateItemsInPages(oldData, forumSearchAccessor, t =>
                  t.forumID === forumID ? updatedEntry : t,
                );
              }
              return sortedInsertIntoPages(oldData, forumSearchAccessor, updatedEntry, compareFn);
            });
          }
        }
      } else {
        updateForumListInAllCaches(forumID, categoryID, entry => ({...entry, [field]: false}), [targetKeyPrefix]);
        queryClient.setQueriesData<InfiniteData<ForumSearchData>>({queryKey: [targetKeyPrefix]}, oldData =>
          oldData ? filterItemsFromPages(oldData, forumSearchAccessor, entry => entry.forumID !== forumID) : oldData,
        );
      }
      updateForumThreadCache(forumID, page => ({...page, [field]: newValue}));
    },
    [
      queryClient,
      findForumListEntry,
      updateForumListInAllCaches,
      updateForumThreadCache,
      defaultForumSortOrder,
      defaultForumSortDirection,
    ],
  );

  /**
   * Update isFavorite for a forum in all list and thread caches.
   * When favoriting, the entry is inserted into /forum/favorites in sorted order.
   * When unfavoriting, the entry is removed from /forum/favorites.
   */
  const updateFavorite = useCallback(
    (forumID: string, categoryID: string | undefined, newValue: boolean) =>
      updateToggleListCache(forumID, categoryID, newValue, 'isFavorite', '/forum/favorites'),
    [updateToggleListCache],
  );

  /**
   * Update isMuted for a forum in all list and thread caches.
   * When muting, the entry is inserted into /forum/mutes in sorted order.
   * When unmuting, the entry is removed from /forum/mutes.
   */
  const updateMute = useCallback(
    (forumID: string, categoryID: string | undefined, newValue: boolean) =>
      updateToggleListCache(forumID, categoryID, newValue, 'isMuted', '/forum/mutes'),
    [updateToggleListCache],
  );

  /**
   * Update isPinned for a forum in all list and thread caches.
   */
  const updatePinned = useCallback(
    (forumID: string, categoryID: string | undefined, newValue: boolean) => {
      updateForumListInAllCaches(forumID, categoryID, entry => ({
        ...entry,
        isPinned: newValue,
      }));
      updateForumThreadCache(forumID, page => ({...page, isPinned: newValue}));
    },
    [updateForumListInAllCaches, updateForumThreadCache],
  );

  /**
   * Prepend a newly created forum thread to the category, recent, and owner
   * list caches. Also prepends the first post to the "your posts" cache.
   */
  const createThread = useCallback(
    (createdForum: ForumData, authorHeader: UserHeader) => {
      const firstPost = createdForum.posts[0];
      const forumListData: ForumListData = {
        forumID: createdForum.forumID,
        creator: authorHeader,
        title: createdForum.title,
        postCount: createdForum.posts.length,
        readCount: createdForum.posts.length,
        createdAt: firstPost?.createdAt ?? new Date().toISOString(),
        lastPoster: authorHeader,
        lastPostAt: firstPost?.createdAt,
        isLocked: createdForum.isLocked,
        isFavorite: createdForum.isFavorite,
        isMuted: createdForum.isMuted,
        isPinned: createdForum.isPinned,
      };

      // Pre-seed the thread detail cache so useForumThreadQuery(forumID) has data when navigating to the thread.
      queryClient.setQueriesData<InfiniteData<ForumData>>({queryKey: [`/forum/${createdForum.forumID}`]}, oldData => {
        if (oldData) {
          return oldData;
        }
        return {
          pages: [createdForum],
          pageParams: [{start: createdForum.paginator.start, limit: createdForum.paginator.limit}],
        };
      });

      // Insert into category cache with category-specific sorting (muted first, pinned first, then sort field).
      for (const query of queryClient.getQueryCache().findAll({
        queryKey: [`/forum/categories/${createdForum.categoryID}`],
      })) {
        queryClient.setQueryData<InfiniteData<CategoryData>>(query.queryKey, oldData => {
          if (!oldData) {
            return oldData;
          }
          const isEventCategory = oldData.pages[0]?.isEventCategory ?? false;
          const {sort, direction} = extractSortParams(
            query.queryKey,
            query.queryKey[0] as string,
            {sort: defaultForumSortOrder, direction: defaultForumSortDirection},
            isEventCategory,
          );
          const compareFn = (a: ForumListData, b: ForumListData) => compareCategoryForumListData(a, b, sort, direction);
          return sortedInsertIntoPages(oldData, categoryAccessor, forumListData, compareFn);
        });
      }

      // Insert into /forum/owner with sorted insertion honoring sort order and direction.
      for (const query of queryClient.getQueryCache().findAll({queryKey: ['/forum/owner']})) {
        const {sort, direction} = extractSortParams(query.queryKey, '/forum/owner', {
          sort: defaultForumSortOrder,
          direction: defaultForumSortDirection,
        });
        const compareFn = buildDirectionalComparator(sort, direction);
        queryClient.setQueryData<InfiniteData<ForumSearchData>>(query.queryKey, oldData =>
          oldData ? sortedInsertIntoPages(oldData, forumSearchAccessor, forumListData, compareFn) : oldData,
        );
      }

      // Insert into /forum/recent. Sort is always update; honor direction.
      for (const query of queryClient.getQueryCache().findAll({queryKey: ['/forum/recent']})) {
        const params = query.queryKey[1] as Record<string, string> | undefined;
        const recentDirection = getEffectiveDirection(
          ForumSort.update,
          (params?.order as ForumSortDirection) ?? defaultForumSortDirection,
        );
        const edge = recentDirection === ForumSortDirection.descending ? 'start' : 'end';
        queryClient.setQueryData<InfiniteData<ForumSearchData>>(query.queryKey, oldData =>
          oldData ? insertAtEdge(oldData, forumSearchAccessor, forumListData, edge) : oldData,
        );
      }

      // Increment thread count in the /forum/categories list cache.
      queryClient.setQueriesData<CategoryData[]>({queryKey: ['/forum/categories']}, oldData => {
        if (!oldData) {
          return oldData;
        }
        return oldData.map(category =>
          category.categoryID === createdForum.categoryID
            ? {...category, paginator: {...category.paginator, total: category.paginator.total + 1}}
            : category,
        );
      });

      // Prepend the first post to "your posts" (byself) PostSearchData cache.
      if (firstPost) {
        queryClient.setQueriesData<InfiniteData<PostSearchData>>(
          {queryKey: ['/forum/post/search', {byself: true}]},
          oldData => {
            if (!oldData) {
              return oldData;
            }
            return {
              ...oldData,
              pages: oldData.pages.map((page, i) => (i === 0 ? {...page, posts: [firstPost, ...page.posts]} : page)),
            };
          },
        );
      }
    },
    [queryClient, defaultForumSortOrder, defaultForumSortDirection],
  );

  return {appendPost, createThread, markRead, updateFavorite, updateMute, updatePinned};
};
