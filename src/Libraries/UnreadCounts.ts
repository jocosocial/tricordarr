/**
 * Helpers for post/read counts used by forum and fez cache reducers.
 *
 * Unread is `postCount - readCount`. Optimistic cache updates can push those
 * two fields out of sync (especially when a list entry is stale relative to
 * a freshly fetched thread), which produces a negative badge until refresh.
 * Every count write should go through these helpers so unread never goes below 0.
 */

export interface PostReadCounts {
  postCount: number;
  readCount: number;
}

/**
 * Floor postCount at 0 and clamp readCount to [0, postCount] so
 * `postCount - readCount` is never negative.
 */
export const clampPostReadCounts = (postCount: number, readCount: number): PostReadCounts => {
  const nextPostCount = Math.max(0, postCount);
  return {
    postCount: nextPostCount,
    readCount: Math.min(Math.max(0, readCount), nextPostCount),
  };
};

/**
 * Unread posts, floored at 0. Use at display sites so a stale cache cannot
 * render a negative badge even if a reducer is missed.
 */
export const unreadCount = (postCount: number, readCount: number): number => {
  return Math.max(0, postCount - readCount);
};

/**
 * Counts after the current user authors a post (or a post arrives while they
 * are viewing the thread/chat). Both fields increment; the result is clamped.
 */
export const applyAppendedPostCounts = (postCount: number, readCount: number): PostReadCounts => {
  return clampPostReadCounts(postCount + 1, readCount + 1);
};

/**
 * Counts after a post is deleted. postCount drops by one; readCount is
 * clamped so it cannot exceed the new postCount.
 */
export const applyDeletedPostCounts = (postCount: number, readCount: number): PostReadCounts => {
  return clampPostReadCounts(postCount - 1, readCount);
};

/**
 * Counts after marking a thread/chat as read.
 *
 * - When `fetchedUpTo` is omitted, the entry is fully read (`readCount = postCount`).
 * - When provided, readCount is the high-water mark of existing readCount and
 *   `fetchedUpTo` (partial read from loaded pages).
 * - `serverPostCount` (and `fetchedUpTo` itself) raise postCount when the list
 *   cache is stale relative to a thread/detail GET. Without that raise, setting
 *   readCount from fetched pages produces a negative unread badge.
 *
 * Returns the current counts unchanged (same numeric values) when the update
 * would be a no-op, so callers can skip writing new object identities.
 */
export const applyMarkReadCounts = (
  currentPostCount: number,
  currentReadCount: number,
  fetchedUpTo?: number,
  serverPostCount?: number,
): PostReadCounts => {
  const nextPostCount = Math.max(currentPostCount, serverPostCount ?? 0, fetchedUpTo ?? 0);
  const desiredReadCount = fetchedUpTo !== undefined ? Math.max(currentReadCount, fetchedUpTo) : nextPostCount;
  return clampPostReadCounts(nextPostCount, desiredReadCount);
};

/**
 * True when applying `next` would not change the stored counts.
 */
export const postReadCountsUnchanged = (current: PostReadCounts, next: PostReadCounts): boolean => {
  return current.postCount === next.postCount && current.readCount === next.readCount;
};
