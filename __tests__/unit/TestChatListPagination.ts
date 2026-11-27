import {PAGE_FILL_DELAY_MS, PAGE_FILL_MAX_DELAY_MS} from '#src/Libraries/ChatList/Constants';
import {
  getEdgeKeys,
  getPageFillAction,
  isEndAppend,
  nextPageFillDelay,
  shouldNudgeLoadPrevious,
} from '#src/Libraries/ChatList/Pagination';

describe('isEndAppend', () => {
  it('is true for a new last item', () => {
    expect(isEndAppend({first: 'a', last: 'c'}, {first: 'a', last: 'd'})).toBe(true);
  });

  it('is false for a prepend (#610)', () => {
    expect(isEndAppend({first: 'c', last: 'f'}, {first: 'a', last: 'f'})).toBe(false);
  });

  it('is false when a refetch kept the same edges', () => {
    expect(isEndAppend({first: 'a', last: 'c'}, {first: 'a', last: 'c'})).toBe(false);
  });

  it('is true for the first data after an empty list', () => {
    expect(isEndAppend({}, {first: 'a', last: 'c'})).toBe(true);
  });

  it('is false when the list empties', () => {
    expect(isEndAppend({first: 'a', last: 'c'}, {})).toBe(false);
  });
});

describe('getEdgeKeys', () => {
  it('reads the first and last keys', () => {
    expect(getEdgeKeys(['x', 'y', 'z'], s => s)).toEqual({first: 'x', last: 'z'});
    expect(getEdgeKeys([], (s: string) => s)).toEqual({first: undefined, last: undefined});
  });
});

describe('shouldNudgeLoadPrevious', () => {
  const base = {ready: true, hasPreviousPage: true, offset: 50, viewportHeight: 500};

  it('nudges near the top once ready', () => {
    expect(shouldNudgeLoadPrevious(base)).toBe(true);
  });

  it('does not nudge before ready, without an older page, or away from the top', () => {
    expect(shouldNudgeLoadPrevious({...base, ready: false})).toBe(false);
    expect(shouldNudgeLoadPrevious({...base, hasPreviousPage: false})).toBe(false);
    expect(shouldNudgeLoadPrevious({...base, offset: 100})).toBe(false);
  });
});

describe('getPageFillAction', () => {
  const base = {
    offset: 0,
    endOffset: 0,
    viewportHeight: 500,
    hasPreviousPage: true,
    hasNextPage: true,
    anchorsToEnd: true,
  };

  it('prefers the previous page when both apply', () => {
    expect(getPageFillAction(base).load).toBe('previous');
  });

  it('pins the end on fill only for an end-anchored list that does not scroll yet', () => {
    expect(getPageFillAction(base).pinEndOnFill).toBe(true);
    expect(getPageFillAction({...base, anchorsToEnd: false}).pinEndOnFill).toBe(false);
    expect(getPageFillAction({...base, endOffset: 300}).pinEndOnFill).toBe(false);
  });

  it('loads the next page near the bottom', () => {
    expect(getPageFillAction({...base, offset: 1000, endOffset: 1200}).load).toBe('next');
    expect(getPageFillAction({...base, offset: 1000, endOffset: 1300}).load).toBeNull();
  });

  it('does nothing without pages to load', () => {
    expect(getPageFillAction({...base, hasPreviousPage: false, hasNextPage: false}).load).toBeNull();
  });
});

describe('nextPageFillDelay', () => {
  it('doubles up to the cap', () => {
    expect(nextPageFillDelay(PAGE_FILL_DELAY_MS)).toBe(PAGE_FILL_DELAY_MS * 2);
    expect(nextPageFillDelay(PAGE_FILL_MAX_DELAY_MS)).toBe(PAGE_FILL_MAX_DELAY_MS);
  });
});
