import {replaceEqualDeep} from '@tanstack/react-query';

/** Whether query data is a plain JSON object that can contain post snapshots. */
const isRecord = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === 'object' && Object.getPrototypeOf(value) === Object.prototype;

/** Preserves newer cached reaction fields when a delayed query or page fetch replaces its data. */
export const shareReactionSnapshots = (oldData: unknown, newData: unknown): unknown => {
  const posts = new Map<number, Record<string, unknown>>();

  /** Collects posts across all old pages so pagination changes cannot bypass the revision check. */
  const collect = (value: unknown): void => {
    if (Array.isArray(value)) {
      value.forEach(collect);
    } else if (isRecord(value)) {
      if (typeof value.postID === 'number' && typeof value.reactionRevision === 'number') {
        const previous = posts.get(value.postID);
        if (!previous || value.reactionRevision > (previous.reactionRevision as number)) {
          posts.set(value.postID, value);
        }
      }
      Object.values(value).forEach(collect);
    }
  };

  /** Keeps unrelated fields from the response while retaining the newest reaction snapshot. */
  const preserve = (value: unknown): unknown => {
    if (Array.isArray(value)) {
      return value.map(preserve);
    }
    if (!isRecord(value)) {
      return value;
    }
    const result = Object.fromEntries(Object.entries(value).map(([key, child]) => [key, preserve(child)]));
    const previous = typeof value.postID === 'number' ? posts.get(value.postID) : undefined;
    if (previous && (previous.reactionRevision as number) > ((value.reactionRevision as number | undefined) ?? 0)) {
      for (const field of ['reactions', 'reactionRevision', 'userLike', 'likeCount', 'laughs', 'likes', 'loves']) {
        if (Object.hasOwn(previous, field)) {
          result[field] = previous[field];
        }
      }
    }
    return result;
  };

  collect(oldData);
  return replaceEqualDeep(oldData, posts.size ? preserve(newData) : newData);
};
