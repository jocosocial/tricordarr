import {compareLfgByStartTime, getLfgSourcePlan, mergeLfgLists, onlyCancelledLfgs} from '#src/Libraries/LfgMerge';
import {FezData} from '#src/Structs/ControllerStructs';

const makeFez = (fezID: string, startTime: string, title = fezID, cancelled = false): FezData =>
  ({fezID, title, startTime, cancelled}) as unknown as FezData;

const ids = (list: FezData[]) => list.map(fez => fez.fezID);

describe('mergeLfgLists', () => {
  it('interleaves joined LFGs into open by start time', () => {
    const open = [makeFez('o1', '2026-03-03T10:00:00Z'), makeFez('o2', '2026-03-03T14:00:00Z')];
    // Joined arrives in updatedAt order, not start time order.
    const joined = [makeFez('j2', '2026-03-03T15:00:00Z'), makeFez('j1', '2026-03-03T12:00:00Z')];
    expect(ids(mergeLfgLists({joined, open, openComplete: true}))).toEqual(['o1', 'j1', 'o2', 'j2']);
  });

  it('holds back joined LFGs that start after the last loaded open page', () => {
    const open = [makeFez('o1', '2026-03-03T10:00:00Z'), makeFez('o2', '2026-03-03T14:00:00Z')];
    const joined = [makeFez('j1', '2026-03-03T12:00:00Z'), makeFez('j2', '2026-03-03T18:00:00Z')];
    expect(ids(mergeLfgLists({joined, open, openComplete: false}))).toEqual(['o1', 'j1', 'o2']);
  });

  it('reveals held-back joined LFGs without reordering as later open pages load', () => {
    const joined = [makeFez('j1', '2026-03-03T12:00:00Z'), makeFez('j2', '2026-03-03T18:00:00Z')];
    const page1 = [makeFez('o1', '2026-03-03T10:00:00Z'), makeFez('o2', '2026-03-03T14:00:00Z')];
    const page2 = [...page1, makeFez('o3', '2026-03-03T16:00:00Z'), makeFez('o4', '2026-03-03T20:00:00Z')];
    const first = ids(mergeLfgLists({joined, open: page1, openComplete: false}));
    const second = ids(mergeLfgLists({joined, open: page2, openComplete: false}));
    expect(second).toEqual(['o1', 'j1', 'o2', 'o3', 'j2', 'o4']);
    // Everything shown before is still shown, in the same order.
    expect(second.filter(id => first.includes(id))).toEqual(first);
  });

  it('shows every joined LFG once open is exhausted', () => {
    const open = [makeFez('o1', '2026-03-03T10:00:00Z')];
    const joined = [makeFez('j1', '2026-03-04T12:00:00Z')];
    expect(ids(mergeLfgLists({joined, open, openComplete: true}))).toEqual(['o1', 'j1']);
  });

  it('shows only joined LFGs when open is empty and complete', () => {
    const joined = [makeFez('j2', '2026-03-03T15:00:00Z'), makeFez('j1', '2026-03-03T12:00:00Z')];
    expect(ids(mergeLfgLists({joined, open: [], openComplete: true}))).toEqual(['j1', 'j2']);
  });

  it('shows no joined LFGs while open has nothing loaded yet', () => {
    const joined = [makeFez('j1', '2026-03-03T12:00:00Z')];
    expect(mergeLfgLists({joined, open: [], openComplete: false})).toEqual([]);
  });

  it('keeps the joined copy of an LFG that appears in both', () => {
    const openCopy = makeFez('same', '2026-03-03T12:00:00Z', 'open copy');
    const joinedCopy = makeFez('same', '2026-03-03T12:00:00Z', 'joined copy');
    const merged = mergeLfgLists({joined: [joinedCopy], open: [openCopy], openComplete: true});
    expect(merged).toEqual([joinedCopy]);
  });

  it('breaks start time ties by title like the API', () => {
    expect(
      compareLfgByStartTime(
        makeFez('a', '2026-03-03T12:00:00Z', 'Alpha'),
        makeFez('b', '2026-03-03T12:00:00Z', 'Beta'),
      ),
    ).toBeLessThan(0);
  });
});

describe('getLfgSourcePlan', () => {
  it('uses open and joined for the all list', () => {
    expect(getLfgSourcePlan({endpoint: 'all'})).toMatchObject({
      openEnabled: true,
      joinedEnabled: true,
      directEnabled: false,
    });
  });

  it('queries joined only when Favorites is on', () => {
    expect(getLfgSourcePlan({endpoint: 'all', favorite: true})).toMatchObject({
      openEnabled: false,
      joinedEnabled: true,
    });
  });

  it('queries joined only when Unread is on', () => {
    expect(getLfgSourcePlan({endpoint: 'all', onlyNew: true})).toMatchObject({
      openEnabled: false,
      joinedEnabled: true,
    });
  });

  it('keeps open off for Joined, and uses only the owner endpoint for Owned and Former', () => {
    expect(getLfgSourcePlan({endpoint: 'joined'})).toMatchObject({openEnabled: false, joinedEnabled: true});
    expect(getLfgSourcePlan({endpoint: 'owner'})).toMatchObject({
      openEnabled: false,
      joinedEnabled: false,
      directEnabled: true,
    });
    expect(getLfgSourcePlan({endpoint: 'former'})).toMatchObject({joinedEnabled: false, directEnabled: true});
  });

  it('queries nothing when disabled', () => {
    expect(getLfgSourcePlan({endpoint: 'all', enabled: false})).toMatchObject({
      openEnabled: false,
      joinedEnabled: false,
      directEnabled: false,
    });
  });
});

describe('onlyCancelledLfgs', () => {
  const fezzes = [
    makeFez('a', '2026-03-03T10:00:00Z'),
    makeFez('b', '2026-03-03T11:00:00Z', 'b', true),
    makeFez('c', '2026-03-03T12:00:00Z'),
  ];

  it('leaves cancelled LFGs in the list when the filter is off', () => {
    expect(ids(onlyCancelledLfgs(fezzes, false))).toEqual(['a', 'b', 'c']);
  });

  it('keeps only cancelled LFGs when the filter is on', () => {
    expect(ids(onlyCancelledLfgs(fezzes, true))).toEqual(['b']);
  });

  it('applies to a merged all list', () => {
    const joined = [makeFez('j1', '2026-03-03T11:00:00Z', 'j1', true), makeFez('j2', '2026-03-03T13:00:00Z')];
    const open = [makeFez('o1', '2026-03-03T10:00:00Z')];
    const merged = mergeLfgLists({joined, open, openComplete: true});
    expect(ids(onlyCancelledLfgs(merged, true))).toEqual(['j1']);
  });
});

describe('getLfgSourcePlan with the Cancelled filter', () => {
  it('queries joined only for the all list, loading every joined page', () => {
    expect(getLfgSourcePlan({endpoint: 'all', cancelledOnly: true})).toMatchObject({
      openEnabled: false,
      joinedEnabled: true,
      loadAllJoined: true,
    });
  });

  it('loads every page of Joined and Owned so a filtered page cannot come up empty', () => {
    expect(getLfgSourcePlan({endpoint: 'joined', cancelledOnly: true})).toMatchObject({loadAllJoined: true});
    expect(getLfgSourcePlan({endpoint: 'owner', cancelledOnly: true})).toMatchObject({
      directEnabled: true,
      loadAllDirect: true,
    });
  });

  it('pages normally when the filter is off', () => {
    expect(getLfgSourcePlan({endpoint: 'joined'})).toMatchObject({loadAllJoined: false});
    expect(getLfgSourcePlan({endpoint: 'owner'})).toMatchObject({loadAllDirect: false});
  });
});
