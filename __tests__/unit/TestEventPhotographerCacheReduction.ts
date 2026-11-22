import {photographerListMembership, withUserPhotographing} from '#src/Libraries/Events/PhotographerCacheReduction';
import {EventData, UserHeader} from '#src/Structs/ControllerStructs';

const me = 'me';
const meHeader: UserHeader = {userID: me, username: 'me', displayName: 'Me'};
const header = (userID: string): UserHeader => ({userID, username: userID});

const makeEvent = (photographerIDs: string[], needsPhotographer = false, eventID = 'event'): EventData =>
  ({
    eventID,
    title: eventID,
    startTime: '2026-03-03T15:00:00Z',
    endTime: '2026-03-03T16:00:00Z',
    timeZone: 'AST',
    location: 'Lido',
    shutternautData: {
      needsPhotographer,
      photographers: photographerIDs.map(header),
      userIsPhotographer: photographerIDs.includes(me),
    },
  }) as unknown as EventData;

describe('withUserPhotographing', () => {
  it('adds your own header when you start photographing', () => {
    const result = withUserPhotographing(makeEvent(['other']), true, meHeader, me);
    expect(result.shutternautData?.userIsPhotographer).toBe(true);
    expect(result.shutternautData?.photographers).toEqual([header('other'), meHeader]);
  });

  it('removes you, and only you, when you stop', () => {
    const result = withUserPhotographing(makeEvent([me, 'other']), false, meHeader, me);
    expect(result.shutternautData?.userIsPhotographer).toBe(false);
    expect(result.shutternautData?.photographers).toEqual([header('other')]);
  });

  it('does not list you twice', () => {
    const result = withUserPhotographing(makeEvent([me]), true, meHeader, me);
    expect(result.shutternautData?.photographers).toEqual([meHeader]);
  });

  it('still flips the flag when your header is not loaded', () => {
    const result = withUserPhotographing(makeEvent([]), true, undefined, me);
    expect(result.shutternautData?.userIsPhotographer).toBe(true);
    expect(result.shutternautData?.photographers).toEqual([]);
  });
});

describe('photographerListMembership', () => {
  const calendar = {cruiseday: 3, hasPhotographer: true};
  const toggled = (ids: string[], isPhotographer: boolean, needs = false) =>
    withUserPhotographing(makeEvent(ids, needs), isPhotographer, meHeader, me);

  it('adds an event to the calendar when you start photographing it', () => {
    expect(photographerListMembership(calendar, toggled([], true), 3)).toBe(true);
  });

  it('removes an event from the calendar when you were its only photographer', () => {
    expect(photographerListMembership(calendar, toggled([me], false), 3)).toBe(false);
  });

  it('keeps an event on the calendar while someone else is still photographing it', () => {
    expect(photographerListMembership(calendar, toggled([me, 'other'], false), 3)).toBe(true);
  });

  it('treats hasPhotographer=false as flagged events nobody has taken', () => {
    const uncovered = {cruiseday: 3, hasPhotographer: false};
    expect(photographerListMembership(uncovered, toggled([], true, true), 3)).toBe(false);
    expect(photographerListMembership(uncovered, toggled([me], false, true), 3)).toBe(true);
    expect(photographerListMembership(uncovered, toggled([me], false, false), 3)).toBe(false);
  });

  it('leaves lists alone that are not photographer-filtered or are for another day', () => {
    expect(photographerListMembership({cruiseday: 3, dayplanner: true}, makeEvent([]), 3)).toBeUndefined();
    expect(photographerListMembership(undefined, makeEvent([]), 3)).toBeUndefined();
    expect(photographerListMembership(calendar, makeEvent([]), 4)).toBeUndefined();
  });
});
