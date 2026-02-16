import {InfiniteData} from '@tanstack/react-query';
import {useMemo} from 'react';

import {ForumData} from '#src/Structs/ControllerStructs';

/**
 * Derives a unified ForumData from an InfiniteData<ForumData> returned by
 * React Query's infinite query. Metadata comes from the first page; posts
 * are flattened across all pages.
 *
 * This is pure derivation -- no state, no copy, no sync. It recomputes only
 * when the React Query `data` reference changes.
 */
export const useForumData = (data: InfiniteData<ForumData> | undefined): ForumData | undefined => {
  return useMemo(() => {
    if (!data || data.pages.length === 0) {
      return undefined;
    }

    const firstPage = data.pages[0];
    // Deduplicate by postID so overlapping pages (e.g. from race conditions
    // or stale cache) never produce duplicate keys in the list.
    const seen = new Set<number>();
    const posts = data.pages
      .flatMap(p => p.posts)
      .filter(p => {
        if (seen.has(p.postID)) {
          return false;
        }
        seen.add(p.postID);
        return true;
      });

    return {
      forumID: firstPage.forumID,
      categoryID: firstPage.categoryID,
      title: firstPage.title,
      creator: firstPage.creator,
      isLocked: firstPage.isLocked,
      isFavorite: firstPage.isFavorite,
      isMuted: firstPage.isMuted,
      eventID: firstPage.eventID,
      isPinned: firstPage.isPinned,
      paginator: {
        start: firstPage.paginator.start,
        total: firstPage.paginator.total,
        limit: posts.length,
      },
      posts,
    };
  }, [data]);
};
