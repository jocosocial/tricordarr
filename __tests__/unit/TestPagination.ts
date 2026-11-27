import {getNextPageParam, getPreviousPageParam} from '#src/Queries/Pagination';
import {FezData, Paginator} from '#src/Structs/ControllerStructs';

const paginatorPage = (start: number, limit: number, total: number) => ({
  paginator: {start, limit, total} as Paginator,
});

const fezPage = (start: number, limit: number, total: number) =>
  ({
    fezID: 'fez-1',
    members: {paginator: {start, limit, total}},
  }) as unknown as FezData;

describe('getNextPageParam', () => {
  it('returns the next aligned window', () => {
    expect(getNextPageParam(paginatorPage(0, 50, 120))).toEqual({start: 50, limit: 50});
  });

  it('returns undefined on the last page', () => {
    expect(getNextPageParam(paginatorPage(100, 50, 120))).toBeUndefined();
    expect(getNextPageParam(paginatorPage(0, 50, 50))).toBeUndefined();
  });

  it('reads the paginator from a fez page', () => {
    expect(getNextPageParam(fezPage(0, 50, 80))).toEqual({start: 50, limit: 50});
    expect(getNextPageParam(fezPage(50, 50, 80))).toBeUndefined();
  });

  it('returns undefined when a fez has no members paginator', () => {
    expect(getNextPageParam({fezID: 'x'} as unknown as FezData)).toBeUndefined();
  });
});

describe('getPreviousPageParam', () => {
  it('returns the previous aligned window', () => {
    expect(getPreviousPageParam(paginatorPage(100, 50, 120))).toEqual({start: 50, limit: 50});
    expect(getPreviousPageParam(paginatorPage(50, 50, 120))).toEqual({start: 0, limit: 50});
  });

  it('returns undefined at the start of the list', () => {
    expect(getPreviousPageParam(paginatorPage(0, 50, 120))).toBeUndefined();
  });

  it('shortens the last previous page for an unaligned start', () => {
    expect(getPreviousPageParam(paginatorPage(37, 50, 120))).toEqual({start: 0, limit: 37});
  });

  it('reaches the start from an unaligned start in one more step', () => {
    expect(getPreviousPageParam(paginatorPage(80, 50, 200))).toEqual({start: 30, limit: 50});
    expect(getPreviousPageParam(paginatorPage(30, 50, 200))).toEqual({start: 0, limit: 30});
    expect(getPreviousPageParam(paginatorPage(0, 30, 200))).toBeUndefined();
  });

  it('reads the paginator from a fez page', () => {
    expect(getPreviousPageParam(fezPage(37, 50, 120))).toEqual({start: 0, limit: 37});
    expect(getPreviousPageParam(fezPage(0, 50, 120))).toBeUndefined();
  });
});
