import {InfiniteData, useQueryClient} from '@tanstack/react-query';
import {useCallback} from 'react';

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
 * Hook that exposes discrete actions for optimistically updating React Query
 * caches after forum mutations. Each action calls `setQueryData` /
 * `setQueriesData` and always returns new objects so React Query detects the
 * change and triggers re-renders.
 *
 * No local state, no useReducer -- just named functions that transform the cache.
 */
export const useForumCacheReducer = () => {
  const queryClient = useQueryClient();

  /**
   * Update a ForumListData entry (matched by forumID) across all ForumSearchData
   * list caches and the CategoryData cache for the given category.
   */
  const updateForumListInAllCaches = useCallback(
    (forumID: string, categoryID: string | undefined, updater: (entry: ForumListData) => ForumListData) => {
      for (const keyPrefix of forumSearchDataKeys) {
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
   */
  const markRead = useCallback(
    (forumID: string, categoryID?: string) => {
      updateForumListInAllCaches(forumID, categoryID, entry => ({
        ...entry,
        readCount: entry.postCount,
      }));
    },
    [updateForumListInAllCaches],
  );

  /**
   * Update isFavorite for a forum in all list and thread caches.
   */
  const updateFavorite = useCallback(
    (forumID: string, categoryID: string | undefined, newValue: boolean) => {
      updateForumListInAllCaches(forumID, categoryID, entry => ({
        ...entry,
        isFavorite: newValue,
      }));
      updateForumThreadCache(forumID, page => ({...page, isFavorite: newValue}));
    },
    [updateForumListInAllCaches, updateForumThreadCache],
  );

  /**
   * Update isMuted for a forum in all list and thread caches.
   */
  const updateMute = useCallback(
    (forumID: string, categoryID: string | undefined, newValue: boolean) => {
      updateForumListInAllCaches(forumID, categoryID, entry => ({
        ...entry,
        isMuted: newValue,
      }));
      updateForumThreadCache(forumID, page => ({...page, isMuted: newValue}));
    },
    [updateForumListInAllCaches, updateForumThreadCache],
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

      // Prepend to category cache.
      queryClient.setQueriesData<InfiniteData<CategoryData>>(
        {queryKey: [`/forum/categories/${createdForum.categoryID}`]},
        oldData => {
          if (!oldData) {
            return oldData;
          }
          return {
            ...oldData,
            pages: oldData.pages.map((page, i) =>
              i === 0 ? {...page, forumThreads: [forumListData, ...(page.forumThreads ?? [])]} : page,
            ),
          };
        },
      );

      // Prepend to /forum/recent and /forum/owner ForumSearchData caches.
      for (const keyPrefix of ['/forum/recent', '/forum/owner']) {
        queryClient.setQueriesData<InfiniteData<ForumSearchData>>({queryKey: [keyPrefix]}, oldData => {
          if (!oldData) {
            return oldData;
          }
          return {
            ...oldData,
            pages: oldData.pages.map((page, i) =>
              i === 0 ? {...page, forumThreads: [forumListData, ...page.forumThreads]} : page,
            ),
          };
        });
      }

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
    [queryClient],
  );

  return {appendPost, createThread, markRead, updateFavorite, updateMute, updatePinned};
};
