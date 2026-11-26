import {
  clampAnchor,
  getFallbackEndIndex,
  getFezInitialScrollIndex,
  getForumInitialScrollIndex,
  getForumThreadReadState,
  getInitialScrollIndex,
} from '#src/Libraries/ChatList/InitialScroll';
import {FezData, ForumData} from '#src/Structs/ControllerStructs';

const fez = (postCount: number, readCount: number, start: number): FezData =>
  ({
    fezID: 'fez-1',
    members: {postCount, readCount, paginator: {start, limit: 50, total: postCount}},
  }) as unknown as FezData;

describe('getFezInitialScrollIndex', () => {
  it('opens on the last post when fully read', () => {
    expect(getFezInitialScrollIndex(fez(50, 50, 0), 50)).toBe(49);
  });

  it('opens on the last post when there is no members data', () => {
    expect(getFezInitialScrollIndex({fezID: 'x'} as unknown as FezData, 10)).toBe(9);
  });

  it('opens on the first unread post, relative to the loaded start', () => {
    expect(getFezInitialScrollIndex(fez(120, 70, 50), 50)).toBe(20);
  });

  it('clamps to zero when the read position is before the loaded window', () => {
    expect(getFezInitialScrollIndex(fez(120, 10, 50), 50)).toBe(0);
  });

  it('clamps to the last loaded post when the read position is past the loaded window', () => {
    expect(getFezInitialScrollIndex(fez(300, 200, 0), 50)).toBe(49);
  });

  it('prefers the frozen initial read count', () => {
    expect(getFezInitialScrollIndex(fez(50, 50, 0), 50, 30)).toBe(30);
    expect(getFezInitialScrollIndex(fez(50, 10, 0), 50, 50)).toBe(49);
  });

  it('returns undefined with nothing loaded', () => {
    expect(getFezInitialScrollIndex(fez(50, 50, 0), 0)).toBeUndefined();
    expect(getFezInitialScrollIndex(fez(50, 20, 0), 0)).toBeUndefined();
  });
});

describe('getForumInitialScrollIndex', () => {
  it('opens on the last post when fully read', () => {
    expect(getForumInitialScrollIndex(50, 0, {readCount: 50, postCount: 50})).toBe(49);
  });

  it('opens on the last post when opened without list data', () => {
    expect(getForumInitialScrollIndex(50, 0, undefined)).toBe(49);
  });

  it('opens on the first unread post, relative to the loaded start', () => {
    expect(getForumInitialScrollIndex(50, 100, {readCount: 130, postCount: 200})).toBe(30);
  });

  it('clamps to the loaded range', () => {
    expect(getForumInitialScrollIndex(50, 100, {readCount: 20, postCount: 200})).toBe(0);
    expect(getForumInitialScrollIndex(50, 0, {readCount: 150, postCount: 200})).toBe(49);
  });

  it('opens on the first post when started from a post, even if it looks fully read', () => {
    expect(getForumInitialScrollIndex(50, 37, undefined, true)).toBe(0);
    expect(getForumInitialScrollIndex(50, 37, {readCount: 200, postCount: 200}, true)).toBe(0);
  });

  it('returns undefined with nothing loaded', () => {
    expect(getForumInitialScrollIndex(0, 0, undefined)).toBeUndefined();
    expect(getForumInitialScrollIndex(0, 0, undefined, true)).toBeUndefined();
  });
});

/** A thread page as the server returns it: `readCount` is the count from before that request. */
const forumPage = (start: number, total: number, readCount: number): ForumData =>
  ({forumID: 'forum-1', paginator: {start, limit: 50, total}, posts: [], readCount}) as unknown as ForumData;

describe('getForumThreadReadState', () => {
  it('reads the page the server chose (no explicit start)', () => {
    const data = {pages: [forumPage(200, 826, 230)], pageParams: [{start: undefined, limit: 50}]};
    expect(getForumThreadReadState(data)).toEqual({readCount: 230, postCount: 826});
  });

  it('ignores pages loaded later, whose fetches already moved the read marker', () => {
    // An older page was prepended and a newer one appended after the first fetch.
    const data = {
      pages: [forumPage(150, 826, 250), forumPage(200, 826, 230), forumPage(250, 826, 300)],
      pageParams: [
        {start: 150, limit: 50},
        {start: undefined, limit: 50},
        {start: 250, limit: 50},
      ],
    };
    expect(getForumThreadReadState(data)).toEqual({readCount: 230, postCount: 826});
  });

  it('is undefined without the server-chosen page or without data', () => {
    expect(
      getForumThreadReadState({pages: [forumPage(0, 826, 5)], pageParams: [{start: 0, limit: 50}]}),
    ).toBeUndefined();
    expect(getForumThreadReadState(undefined)).toBeUndefined();
  });

  it('reports a never-read thread as 0 and a fully read one as the total', () => {
    const params = [{start: undefined, limit: 50}];
    expect(getForumThreadReadState({pages: [forumPage(0, 40, 0)], pageParams: params})).toEqual({
      readCount: 0,
      postCount: 40,
    });
    expect(getForumThreadReadState({pages: [forumPage(0, 40, 40)], pageParams: params})).toEqual({
      readCount: 40,
      postCount: 40,
    });
  });

  it('feeds getForumInitialScrollIndex to open at the first unread post', () => {
    const readState = getForumThreadReadState({
      pages: [forumPage(200, 826, 230)],
      pageParams: [{start: undefined, limit: 50}],
    });
    expect(getForumInitialScrollIndex(50, 200, readState)).toBe(30);
  });
});

describe('clampAnchor', () => {
  it('leaves an end anchor alone', () => {
    expect(clampAnchor('end', 3)).toBe('end');
  });

  it('keeps an index inside the loaded items', () => {
    expect(clampAnchor({index: 2}, 3)).toEqual({index: 2});
  });

  it('clamps an index past the end to the last item (stale index from another chat)', () => {
    expect(clampAnchor({index: 9}, 3)).toEqual({index: 2});
  });

  it('clamps to 0 for an empty list or a negative index', () => {
    expect(clampAnchor({index: 4}, 0)).toEqual({index: 0});
    expect(clampAnchor({index: -1}, 3)).toEqual({index: 0});
  });
});

describe('getInitialScrollIndex', () => {
  it('leaves an end anchor to startRenderingFromBottom', () => {
    expect(getInitialScrollIndex('end', 9, true)).toBeUndefined();
  });

  it('opens an end anchor on its last item on the fallback path', () => {
    expect(getInitialScrollIndex('end', 9, false)).toBe(9);
    expect(getInitialScrollIndex('end', undefined, false)).toBeUndefined();
  });

  it('opens an index anchor on its index, except index 0', () => {
    expect(getInitialScrollIndex({index: 5}, 9, true)).toBe(5);
    expect(getInitialScrollIndex({index: 0}, 9, true)).toBeUndefined();
  });
});

describe('getFallbackEndIndex', () => {
  it('is the last index, excluding index 0', () => {
    expect(getFallbackEndIndex(10)).toBe(9);
    expect(getFallbackEndIndex(1)).toBeUndefined();
    expect(getFallbackEndIndex(0)).toBeUndefined();
  });
});
