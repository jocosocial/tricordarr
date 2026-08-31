import {
  applyAppendedPostCounts,
  applyDeletedPostCounts,
  applyMarkReadCounts,
  clampPostReadCounts,
  postReadCountsUnchanged,
  unreadCount,
} from '#src/Libraries/UnreadCounts';

describe('clampPostReadCounts', () => {
  it('leaves consistent counts unchanged', () => {
    expect(clampPostReadCounts(10, 7)).toEqual({postCount: 10, readCount: 7});
  });

  it('clamps readCount that exceeds postCount', () => {
    expect(clampPostReadCounts(10, 12)).toEqual({postCount: 10, readCount: 10});
  });

  it('floors negative postCount and readCount', () => {
    expect(clampPostReadCounts(-3, -1)).toEqual({postCount: 0, readCount: 0});
  });
});

describe('unreadCount', () => {
  it('returns postCount minus readCount', () => {
    expect(unreadCount(10, 7)).toBe(3);
  });

  it('never returns a negative value', () => {
    expect(unreadCount(10, 12)).toBe(0);
  });
});

describe('applyAppendedPostCounts', () => {
  it('increments both fields together', () => {
    expect(applyAppendedPostCounts(10, 10)).toEqual({postCount: 11, readCount: 11});
    expect(applyAppendedPostCounts(10, 4)).toEqual({postCount: 11, readCount: 5});
  });

  it('repairs an already-negative unread', () => {
    expect(applyAppendedPostCounts(10, 12)).toEqual({postCount: 11, readCount: 11});
  });
});

describe('applyDeletedPostCounts', () => {
  it('decrements postCount and clamps readCount', () => {
    expect(applyDeletedPostCounts(10, 7)).toEqual({postCount: 9, readCount: 7});
    expect(applyDeletedPostCounts(10, 10)).toEqual({postCount: 9, readCount: 9});
  });

  it('does not go below zero', () => {
    expect(applyDeletedPostCounts(0, 0)).toEqual({postCount: 0, readCount: 0});
  });
});

describe('applyMarkReadCounts', () => {
  it('marks fully read when fetchedUpTo is omitted', () => {
    expect(applyMarkReadCounts(10, 4)).toEqual({postCount: 10, readCount: 10});
  });

  it('raises postCount when fetchedUpTo exceeds a stale list postCount', () => {
    // Issue #515: opening a thread whose list entry is stale (10 posts) after
    // the server has 12, and the loaded page covers all 12, used to set
    // readCount=12 while leaving postCount=10 → "-2 new posts".
    expect(applyMarkReadCounts(10, 4, 12)).toEqual({postCount: 12, readCount: 12});
  });

  it('raises postCount from serverPostCount without over-reading', () => {
    expect(applyMarkReadCounts(10, 4, 8, 12)).toEqual({postCount: 12, readCount: 8});
  });

  it('does not lower an existing readCount', () => {
    expect(applyMarkReadCounts(10, 8, 5)).toEqual({postCount: 10, readCount: 8});
  });

  it('is a numeric no-op when already fully read at the server total', () => {
    const current = {postCount: 10, readCount: 10};
    const next = applyMarkReadCounts(10, 10, 10, 10);
    expect(next).toEqual(current);
    expect(postReadCountsUnchanged(current, next)).toBe(true);
  });
});
