import {InfiniteData, useQueryClient} from '@tanstack/react-query';
import {useCallback} from 'react';

import {useConfig} from '#src/Context/Contexts/ConfigContext';
import {ForumSort, ForumSortDirection} from '#src/Enums/ForumSortFilter';
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
 * Insert a ForumListData entry into the correct sorted position across paginated pages.
 * The compareFn should represent the final sort order (including direction).
 */
const sortedInsertIntoPages = <T extends {forumThreads?: ForumListData[]}>(
  pages: T[],
  newEntry: ForumListData,
  compareFn: (a: ForumListData, b: ForumListData) => number,
): T[] => {
  let inserted = false;
  const result = pages.map(page => {
    if (inserted) return page;
    const threads = page.forumThreads ?? [];
    const index = threads.findIndex(t => compareFn(newEntry, t) <= 0);
    if (index !== -1) {
      inserted = true;
      return {...page, forumThreads: [...threads.slice(0, index), newEntry, ...threads.slice(index)]};
    }
    return page;
  });
  if (!inserted && result.length > 0) {
    const lastIdx = result.length - 1;
    const lastThreads = result[lastIdx].forumThreads ?? [];
    result[lastIdx] = {...result[lastIdx], forumThreads: [...lastThreads, newEntry]};
  }
  return result;
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
      const excludeSet = excludeKeyPrefixes ? new Set(excludeKeyPrefixes) : undefined;
      for (const keyPrefix of forumSearchDataKeys) {
        if (excludeSet?.has(keyPrefix)) {
          continue;
        }
        queryClient.setQueriesData<InfiniteData<ForumSearchData>>({queryKey: [keyPrefix]}, oldData => {
          if (!oldData) {
            return oldData;
          }
          return {
            ...oldData,
            pages: oldData.pages.map(page => ({
              ...page,
              forumThreads: page.forumThreads.map(entry => (entry.forumID === forumID ? updater(entry) : entry)),
            })),
          };
        });
      }
      if (categoryID) {
        queryClient.setQueriesData<InfiniteData<CategoryData>>(
          {queryKey: [`/forum/categories/${categoryID}`]},
          oldData => {
            if (!oldData) {
              return oldData;
            }
            return {
              ...oldData,
              pages: oldData.pages.map(page => ({
                ...page,
                forumThreads: page.forumThreads?.map(entry => (entry.forumID === forumID ? updater(entry) : entry)),
              })),
            };
          },
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
      // Update the thread cache (InfiniteData<ForumData>).
      // Only append the post to the last page's posts array. Leave the paginator
      // untouched so getNextPageParam still returns undefined and no spurious
      // fetchNextPage is triggered. The server will correct the paginator on
      // the next real refetch.
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

      // Update ForumSearchData and CategoryData list caches.
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

      for (const query of queryClient.getQueryCache().findAll({queryKey: ['/forum/recent']})) {
        const params = query.queryKey[1] as Record<string, string> | undefined;
        const recentDirection = getEffectiveDirection(
          ForumSort.update,
          (params?.order as ForumSortDirection) ?? defaultForumSortDirection,
        );

        queryClient.setQueryData<InfiniteData<ForumSearchData>>(query.queryKey, oldData => {
          if (!oldData) {
            return oldData;
          }
          let found: {pageIndex: number; entry: ForumListData} | null = null;
          for (let pi = 0; pi < oldData.pages.length; pi++) {
            const entry = oldData.pages[pi].forumThreads.find(t => t.forumID === forumID);
            if (entry) {
              found = {pageIndex: pi, entry};
              break;
            }
          }
          if (!found) {
            const threadCacheEntries = queryClient.getQueriesData<InfiniteData<ForumData>>({
              queryKey: [`/forum/${forumID}`],
            });
            const firstPage = threadCacheEntries[0]?.[1]?.pages?.[0];
            if (firstPage) {
              const newEntry = forumListDataFromForumData(firstPage);
              if (recentDirection === ForumSortDirection.descending) {
                return {
                  ...oldData,
                  pages: oldData.pages.map((p, i) =>
                    i === 0 ? {...p, forumThreads: [newEntry, ...p.forumThreads]} : p,
                  ),
                };
              }
              const lastIdx = oldData.pages.length - 1;
              return {
                ...oldData,
                pages: oldData.pages.map((p, i) =>
                  i === lastIdx ? {...p, forumThreads: [...p.forumThreads, newEntry]} : p,
                ),
              };
            }
            return oldData;
          }
          const {entry} = found;
          const updatedEntry = {...entry, readCount: entry.postCount};
          if (entry.readCount === entry.postCount) {
            return {
              ...oldData,
              pages: oldData.pages.map(p => ({
                ...p,
                forumThreads: p.forumThreads.map(t => (t.forumID === forumID ? updatedEntry : t)),
              })),
            };
          }
          if (recentDirection === ForumSortDirection.descending) {
            return {
              ...oldData,
              pages: oldData.pages.map((p, i) => {
                if (i === 0) {
                  const withoutEntry = p.forumThreads.filter(t => t.forumID !== forumID);
                  return {...p, forumThreads: [updatedEntry, ...withoutEntry]};
                }
                return {...p, forumThreads: p.forumThreads.filter(t => t.forumID !== forumID)};
              }),
            };
          }
          const lastIdx = oldData.pages.length - 1;
          return {
            ...oldData,
            pages: oldData.pages.map((p, i) => {
              if (i === lastIdx) {
                const withoutEntry = p.forumThreads.filter(t => t.forumID !== forumID);
                return {...p, forumThreads: [...withoutEntry, updatedEntry]};
              }
              return {...p, forumThreads: p.forumThreads.filter(t => t.forumID !== forumID)};
            }),
          };
        });
      }
    },
    [queryClient, updateForumListInAllCaches, defaultForumSortDirection],
  );

  /**
   * Update isFavorite for a forum in all list and thread caches.
   * When favoriting, the entry is inserted into /forum/favorites in sorted order.
   * When unfavoriting, the entry is removed from /forum/favorites.
   */
  const updateFavorite = useCallback(
    (forumID: string, categoryID: string | undefined, newValue: boolean) => {
      if (newValue) {
        // Update all caches except /forum/favorites (handled separately below).
        updateForumListInAllCaches(forumID, categoryID, entry => ({...entry, isFavorite: true}), ['/forum/favorites']);

        // Find the ForumListData from any available cache to insert into /forum/favorites.
        // Other caches were already updated synchronously above so entries there have isFavorite: true.
        let favoriteEntry: ForumListData | undefined;
        for (const keyPrefix of forumSearchDataKeys) {
          if (keyPrefix === '/forum/favorites') {
            continue;
          }
          for (const [, data] of queryClient.getQueriesData<InfiniteData<ForumSearchData>>({queryKey: [keyPrefix]})) {
            for (const page of data?.pages ?? []) {
              favoriteEntry = page.forumThreads.find(t => t.forumID === forumID);
              if (favoriteEntry) break;
            }
            if (favoriteEntry) break;
          }
          if (favoriteEntry) break;
        }
        if (!favoriteEntry && categoryID) {
          for (const [, data] of queryClient.getQueriesData<InfiniteData<CategoryData>>({
            queryKey: [`/forum/categories/${categoryID}`],
          })) {
            for (const page of data?.pages ?? []) {
              favoriteEntry = page.forumThreads?.find(t => t.forumID === forumID);
              if (favoriteEntry) break;
            }
            if (favoriteEntry) break;
          }
        }
        if (!favoriteEntry) {
          const threadEntries = queryClient.getQueriesData<InfiniteData<ForumData>>({queryKey: [`/forum/${forumID}`]});
          const firstPage = threadEntries[0]?.[1]?.pages?.[0];
          if (firstPage) {
            favoriteEntry = forumListDataFromForumData(firstPage);
          }
        }

        if (favoriteEntry) {
          const entryWithFavorite: ForumListData = {...favoriteEntry, isFavorite: true};
          for (const query of queryClient.getQueryCache().findAll({queryKey: ['/forum/favorites']})) {
            const params = query.queryKey[1] as Record<string, string> | undefined;
            const sort = (params?.sort as ForumSort) ?? defaultForumSortOrder ?? getApiDefaultSort('/forum/favorites');
            const direction = getEffectiveDirection(
              sort,
              (params?.order as ForumSortDirection) ?? defaultForumSortDirection,
            );
            const compareFn = (a: ForumListData, b: ForumListData) => {
              const cmp = compareForumListData(a, b, sort);
              return direction === ForumSortDirection.ascending ? cmp : -cmp;
            };
            queryClient.setQueryData<InfiniteData<ForumSearchData>>(query.queryKey, oldData => {
              if (!oldData) {
                return oldData;
              }
              const alreadyExists = oldData.pages.some(p => p.forumThreads.some(t => t.forumID === forumID));
              if (alreadyExists) {
                return {
                  ...oldData,
                  pages: oldData.pages.map(p => ({
                    ...p,
                    forumThreads: p.forumThreads.map(t => (t.forumID === forumID ? entryWithFavorite : t)),
                  })),
                };
              }
              return {...oldData, pages: sortedInsertIntoPages(oldData.pages, entryWithFavorite, compareFn)};
            });
          }
        }
      } else {
        // Update all caches except /forum/favorites (removed below).
        updateForumListInAllCaches(forumID, categoryID, entry => ({...entry, isFavorite: false}), ['/forum/favorites']);
        // Remove the entry from /forum/favorites.
        queryClient.setQueriesData<InfiniteData<ForumSearchData>>({queryKey: ['/forum/favorites']}, oldData => {
          if (!oldData) {
            return oldData;
          }
          return {
            ...oldData,
            pages: oldData.pages.map(page => ({
              ...page,
              forumThreads: page.forumThreads.filter(entry => entry.forumID !== forumID),
            })),
          };
        });
      }
      updateForumThreadCache(forumID, page => ({...page, isFavorite: newValue}));
    },
    [queryClient, updateForumListInAllCaches, updateForumThreadCache, defaultForumSortOrder, defaultForumSortDirection],
  );

  /**
   * Update isMuted for a forum in all list and thread caches.
   * When muting, the entry is inserted into /forum/mutes in sorted order.
   * When unmuting, the entry is removed from /forum/mutes.
   */
  const updateMute = useCallback(
    (forumID: string, categoryID: string | undefined, newValue: boolean) => {
      if (newValue) {
        // Update all caches except /forum/mutes (handled separately below).
        updateForumListInAllCaches(forumID, categoryID, entry => ({...entry, isMuted: true}), ['/forum/mutes']);

        // Find the ForumListData from any available cache to insert into /forum/mutes.
        let muteEntry: ForumListData | undefined;
        for (const keyPrefix of forumSearchDataKeys) {
          if (keyPrefix === '/forum/mutes') {
            continue;
          }
          for (const [, data] of queryClient.getQueriesData<InfiniteData<ForumSearchData>>({queryKey: [keyPrefix]})) {
            for (const page of data?.pages ?? []) {
              muteEntry = page.forumThreads.find(t => t.forumID === forumID);
              if (muteEntry) break;
            }
            if (muteEntry) break;
          }
          if (muteEntry) break;
        }
        if (!muteEntry && categoryID) {
          for (const [, data] of queryClient.getQueriesData<InfiniteData<CategoryData>>({
            queryKey: [`/forum/categories/${categoryID}`],
          })) {
            for (const page of data?.pages ?? []) {
              muteEntry = page.forumThreads?.find(t => t.forumID === forumID);
              if (muteEntry) break;
            }
            if (muteEntry) break;
          }
        }
        if (!muteEntry) {
          const threadEntries = queryClient.getQueriesData<InfiniteData<ForumData>>({queryKey: [`/forum/${forumID}`]});
          const firstPage = threadEntries[0]?.[1]?.pages?.[0];
          if (firstPage) {
            muteEntry = forumListDataFromForumData(firstPage);
          }
        }

        if (muteEntry) {
          const entryWithMuted: ForumListData = {...muteEntry, isMuted: true};
          for (const query of queryClient.getQueryCache().findAll({queryKey: ['/forum/mutes']})) {
            const params = query.queryKey[1] as Record<string, string> | undefined;
            const sort = (params?.sort as ForumSort) ?? defaultForumSortOrder ?? getApiDefaultSort('/forum/mutes');
            const direction = getEffectiveDirection(
              sort,
              (params?.order as ForumSortDirection) ?? defaultForumSortDirection,
            );
            const compareFn = (a: ForumListData, b: ForumListData) => {
              const cmp = compareForumListData(a, b, sort);
              return direction === ForumSortDirection.ascending ? cmp : -cmp;
            };
            queryClient.setQueryData<InfiniteData<ForumSearchData>>(query.queryKey, oldData => {
              if (!oldData) {
                return oldData;
              }
              const alreadyExists = oldData.pages.some(p => p.forumThreads.some(t => t.forumID === forumID));
              if (alreadyExists) {
                return {
                  ...oldData,
                  pages: oldData.pages.map(p => ({
                    ...p,
                    forumThreads: p.forumThreads.map(t => (t.forumID === forumID ? entryWithMuted : t)),
                  })),
                };
              }
              return {...oldData, pages: sortedInsertIntoPages(oldData.pages, entryWithMuted, compareFn)};
            });
          }
        }
      } else {
        // Update all caches except /forum/mutes (removed below).
        updateForumListInAllCaches(forumID, categoryID, entry => ({...entry, isMuted: false}), ['/forum/mutes']);
        // Remove the entry from /forum/mutes.
        queryClient.setQueriesData<InfiniteData<ForumSearchData>>({queryKey: ['/forum/mutes']}, oldData => {
          if (!oldData) {
            return oldData;
          }
          return {
            ...oldData,
            pages: oldData.pages.map(page => ({
              ...page,
              forumThreads: page.forumThreads.filter(entry => entry.forumID !== forumID),
            })),
          };
        });
      }
      updateForumThreadCache(forumID, page => ({...page, isMuted: newValue}));
    },
    [queryClient, updateForumListInAllCaches, updateForumThreadCache, defaultForumSortOrder, defaultForumSortDirection],
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
        const params = query.queryKey[1] as Record<string, string> | undefined;
        queryClient.setQueryData<InfiniteData<CategoryData>>(query.queryKey, oldData => {
          if (!oldData) {
            return oldData;
          }
          const isEventCategory = oldData.pages[0]?.isEventCategory ?? false;
          const sort =
            (params?.sort as ForumSort) ??
            defaultForumSortOrder ??
            getApiDefaultSort(query.queryKey[0] as string, isEventCategory);
          const direction = getEffectiveDirection(
            sort,
            (params?.order as ForumSortDirection) ?? defaultForumSortDirection,
          );
          const compareFn = (a: ForumListData, b: ForumListData) => compareCategoryForumListData(a, b, sort, direction);
          return {...oldData, pages: sortedInsertIntoPages(oldData.pages, forumListData, compareFn)};
        });
      }

      // Insert into /forum/owner with sorted insertion honoring sort order and direction.
      for (const query of queryClient.getQueryCache().findAll({queryKey: ['/forum/owner']})) {
        const params = query.queryKey[1] as Record<string, string> | undefined;
        const sort = (params?.sort as ForumSort) ?? defaultForumSortOrder ?? ForumSort.title;
        const direction = getEffectiveDirection(
          sort,
          (params?.order as ForumSortDirection) ?? defaultForumSortDirection,
        );
        const compareFn = (a: ForumListData, b: ForumListData) => {
          const cmp = compareForumListData(a, b, sort);
          return direction === ForumSortDirection.ascending ? cmp : -cmp;
        };
        queryClient.setQueryData<InfiniteData<ForumSearchData>>(query.queryKey, oldData => {
          if (!oldData) {
            return oldData;
          }
          return {...oldData, pages: sortedInsertIntoPages(oldData.pages, forumListData, compareFn)};
        });
      }

      // Insert into /forum/recent. Sort is always update; honor direction.
      for (const query of queryClient.getQueryCache().findAll({queryKey: ['/forum/recent']})) {
        const params = query.queryKey[1] as Record<string, string> | undefined;
        const recentDirection = getEffectiveDirection(
          ForumSort.update,
          (params?.order as ForumSortDirection) ?? defaultForumSortDirection,
        );
        queryClient.setQueryData<InfiniteData<ForumSearchData>>(query.queryKey, oldData => {
          if (!oldData) {
            return oldData;
          }
          if (recentDirection === ForumSortDirection.descending) {
            return {
              ...oldData,
              pages: oldData.pages.map((page, i) =>
                i === 0 ? {...page, forumThreads: [forumListData, ...page.forumThreads]} : page,
              ),
            };
          }
          const lastIdx = oldData.pages.length - 1;
          return {
            ...oldData,
            pages: oldData.pages.map((page, i) =>
              i === lastIdx ? {...page, forumThreads: [...page.forumThreads, forumListData]} : page,
            ),
          };
        });
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
