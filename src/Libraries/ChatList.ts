import {FezData, ForumListData} from '#src/Structs/ControllerStructs';

/**
 * Index of the post a fez chat should open at, within the loaded posts.
 *
 * A fully read chat opens on its last post. Otherwise it opens on the first unread post, which is
 * `readCount - paginator.start` and is clamped to the loaded range because the read position can be
 * outside the pages fetched so far. Returns undefined when nothing is loaded.
 *
 * @param fez The fez, whose `members` carry the read count, post count, and paginator.
 * @param loadedCount Number of posts currently loaded.
 * @param initialReadCount Frozen read count to use instead of `fez.members.readCount`.
 */
export const getFezInitialScrollIndex = (
  fez: FezData,
  loadedCount: number,
  initialReadCount?: number,
): number | undefined => {
  if (loadedCount <= 0) {
    return undefined;
  }
  const readCount = initialReadCount ?? fez.members?.readCount;
  if (!fez.members || readCount === undefined || readCount === fez.members.postCount) {
    return loadedCount - 1;
  }
  const loadedStart = fez.members.paginator?.start ?? 0;
  return Math.min(Math.max(readCount - loadedStart, 0), loadedCount - 1);
};

/**
 * Index of the post a forum thread should open at, within the loaded posts.
 *
 * `startFromPost` returns the selected post as the first loaded item, so that is index 0. A thread
 * with no list data, or one that is fully read, opens on its last post. Otherwise it opens on the
 * first unread post (`readCount - paginatorStart`), clamped to the loaded range. Returns undefined
 * when nothing is loaded.
 *
 * @param loadedCount Number of posts currently loaded.
 * @param paginatorStart Offset of the first loaded post within the whole thread.
 * @param forumListData Read state from the forum list, when the thread was opened from it.
 * @param startFromPost True when the thread was opened from a specific post.
 */
export const getForumInitialScrollIndex = (
  loadedCount: number,
  paginatorStart: number,
  forumListData?: Pick<ForumListData, 'readCount' | 'postCount'>,
  startFromPost?: boolean,
): number | undefined => {
  if (loadedCount <= 0) {
    return undefined;
  }
  if (startFromPost) {
    return 0;
  }
  if (!forumListData || forumListData.readCount === forumListData.postCount) {
    return loadedCount - 1;
  }
  return Math.min(Math.max(forumListData.readCount - paginatorStart, 0), loadedCount - 1);
};
