import {getFezInitialScrollIndex, getForumInitialScrollIndex} from '#src/Libraries/ChatList';
import {FezData} from '#src/Structs/ControllerStructs';

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
