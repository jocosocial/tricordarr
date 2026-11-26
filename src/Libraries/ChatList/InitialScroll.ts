/**
 * Where a chat opens. FlashList only honors `initialScrollIndex` at mount, so screens compute the
 * index from read state once, freeze it, and remount the list via `key` when it becomes known (see
 * `FezChatScreen`, `ForumThreadScreenBase`).
 */

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

/**
 * The anchor with its index clamped to the items present. FlashList's initial layout throws ("index
 * out of bounds, not enough layouts") for an `initialScrollIndex` past the end of `data`, so an index
 * computed from stale read state must never reach it. The screens prevent that (each chat or thread
 * gets its own screen instance, see `getId` in `CommonScreens.tsx`); this keeps a wrong index to a
 * wrong position instead of a crash.
 *
 * @param anchor The list's anchor.
 * @param dataLength Number of items in the list.
 */
export const clampAnchor = (anchor: 'end' | {index: number}, dataLength: number): 'end' | {index: number} =>
  anchor === 'end' ? anchor : {index: Math.max(0, Math.min(anchor.index, dataLength - 1))};

/**
 * The `initialScrollIndex` ChatList hands FlashList for its anchor.
 *
 * An end anchor normally has none: `startRenderingFromBottom` opens it at the bottom. Only on the
 * fallback path (`startRenderingFromBottom` off) does it open on its last item. Index 0 is excluded
 * for both: scrolling to it would hide the list header past the top edge, and the first item is
 * already visible from offset 0.
 *
 * @param anchor The list's anchor.
 * @param fallbackEndIndex Last index at mount, or undefined when there were fewer than two items.
 * @param startRenderingFromBottom Whether `startRenderingFromBottom` positions end anchors.
 */
export const getInitialScrollIndex = (
  anchor: 'end' | {index: number},
  fallbackEndIndex: number | undefined,
  startRenderingFromBottom: boolean,
): number | undefined => {
  if (anchor === 'end') {
    return startRenderingFromBottom ? undefined : fallbackEndIndex;
  }
  return anchor.index > 0 ? anchor.index : undefined;
};

/**
 * The last index an end-anchored list opens on when `startRenderingFromBottom` is off. Captured
 * once at mount. Undefined for fewer than two items (index 0 is excluded, see `getInitialScrollIndex`).
 *
 * @param dataLength Number of items at mount.
 */
export const getFallbackEndIndex = (dataLength: number): number | undefined =>
  dataLength > 1 ? dataLength - 1 : undefined;
