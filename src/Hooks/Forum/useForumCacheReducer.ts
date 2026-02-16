import {InfiniteData, useQueryClient} from '@tanstack/react-query';
import {useCallback} from 'react';

import {
  CategoryData,
  ForumData,
  ForumListData,
  ForumSearchData,
  PostData,
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
   * Append a newly created post to the thread cache and update all forum
   * list caches with the new post count / last poster info.
   */
  const appendPost = useCallback(
    (forumID: string, categoryID: string, newPost: PostData, authorHeader: UserHeader) => {
      // 1. Update the thread cache (InfiniteData<ForumData>)
      // Only append the post to the last page's posts array. Leave the paginator
      // untouched so getNextPageParam still returns undefined and no spurious
      // fetchNextPage is triggered. The server will correct the paginator on
      // the next real refetch.
      queryClient.setQueriesData<InfiniteData<ForumData>>({queryKey: [`/forum/${forumID}`]}, oldData => {
        if (!oldData) {
          return oldData;
        }
        const lastPageIndex = oldData.pages.length - 1;
        return {
          ...oldData,
          pages: oldData.pages.map((page, i) => {
            if (i !== lastPageIndex) {
              return page;
            }
            if (page.posts.some(p => p.postID === newPost.postID)) {
              return page;
            }
            return {
              ...page,
              posts: [...page.posts, newPost],
            };
          }),
        };
      });

      // 2. Update ForumSearchData list caches
      for (const keyPrefix of forumSearchDataKeys) {
        queryClient.setQueriesData<InfiniteData<ForumSearchData>>({queryKey: [keyPrefix]}, oldData => {
          if (!oldData) {
            return oldData;
          }
          return {
            ...oldData,
            pages: oldData.pages.map(page => ({
              ...page,
              forumThreads: page.forumThreads.map(entry => updateForumListEntry(entry, forumID, authorHeader, newPost)),
            })),
          };
        });
      }

      // 3. Update CategoryData cache for the specific category
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
                forumThreads: page.forumThreads?.map(entry =>
                  updateForumListEntry(entry, forumID, authorHeader, newPost),
                ),
              })),
            };
          },
        );
      }
    },
    [queryClient],
  );

  return {appendPost};
};
