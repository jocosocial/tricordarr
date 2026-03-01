import {InfiniteData} from '@tanstack/react-query';
import {useMemo} from 'react';

import {usePrivilege} from '#src/Context/Contexts/PrivilegeContext';
import {CategoryData, ForumListData} from '#src/Structs/ControllerStructs';

/**
 * Derives a flat ForumListData[] and restriction flag from an
 * InfiniteData<CategoryData> returned by React Query's infinite query.
 * Forum threads are flattened across all pages; restriction is read from
 * the first page and overridden to false for moderators.
 *
 * This is pure derivation -- no state, no copy, no sync. It recomputes only
 * when the React Query `data` reference or privilege changes.
 */
export const useForumListData = (
  data: InfiniteData<CategoryData> | undefined,
): {forumListData: ForumListData[]; isUserRestricted: boolean} => {
  const {hasModerator} = usePrivilege();
  return useMemo(() => {
    if (!data || data.pages.length === 0) {
      return {forumListData: [], isUserRestricted: false};
    }
    const forumListData = data.pages.flatMap(p => p.forumThreads || []);
    const firstPage = data.pages[0];
    const isUserRestricted = hasModerator ? false : firstPage.isEventCategory || firstPage.isRestricted;
    return {forumListData, isUserRestricted};
  }, [data, hasModerator]);
};
