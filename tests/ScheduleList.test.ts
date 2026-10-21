import {InfiniteData} from '@tanstack/react-query';

import {buildScheduleList, resolveScheduleSources} from '#src/Libraries/Schedule';
import {EventData, FezData, FezListData} from '#src/Structs/ControllerStructs';
import {ScheduleFilterSettings} from '#src/Types';

const baseFilterSettings: ScheduleFilterSettings = {
  eventSources: [],
  eventTypeFilter: undefined,
  eventFavoriteFilter: false,
  eventShutternautFilter: undefined,
  eventPersonalUnreadFilter: false,
  showJoinedLfgs: false,
  showOpenLfgs: false,
};

const makeEvent = (overrides: Partial<EventData> = {}): EventData => ({
  eventID: overrides.eventID ?? 'event-1',
  uid: 'uid-1',
  title: 'Test Event',
  description: '',
  startTime: '2026-01-01T12:00:00Z',
  endTime: '2026-01-01T13:00:00Z',
  timeZone: 'EST',
  timeZoneID: 'America/New_York',
  location: 'Deck 5',
  eventType: 'Official',
  lastUpdateTime: '2026-01-01T00:00:00Z',
  isFavorite: false,
  performers: [],
  ...overrides,
});

const makeFez = (overrides: Partial<FezData> = {}): FezData => ({
  fezID: overrides.fezID ?? 'fez-1',
  owner: {userID: 'user-1', username: 'testuser'},
  // Avoid importing the FezType/FezVisibility enums here: they pull in CommonStackComponents,
  // which transitively imports @react-navigation/native (ESM), which this project's Jest
  // config doesn't transform. Neither field affects buildScheduleList's behavior.
  fezType: 'gaming' as FezData['fezType'],
  visibility: 'public' as FezData['visibility'],
  title: 'Test Fez',
  info: '',
  startTime: '2026-01-01T12:00:00Z',
  participantCount: 1,
  minParticipants: 1,
  maxParticipants: 10,
  cancelled: false,
  lastModificationTime: '2026-01-01T00:00:00Z',
  ...overrides,
});

const makePage = (fezzes: FezData[]): InfiniteData<FezListData> => ({
  pages: [{paginator: {total: fezzes.length, start: 0, limit: fezzes.length}, fezzes}],
  pageParams: [undefined],
});

describe('resolveScheduleSources', () => {
  it('falls back to Official + Private Events when no source is selected', () => {
    const sources = resolveScheduleSources(baseFilterSettings);
    expect(sources).toEqual(new Set(['officialEvents', 'privateEvents']));
  });

  it('adds Joined LFGs to the default set when the config setting is on', () => {
    const sources = resolveScheduleSources({...baseFilterSettings, showJoinedLfgs: true});
    expect(sources).toEqual(new Set(['officialEvents', 'privateEvents', 'lfgJoined']));
  });

  it('adds Open LFGs to the default set when the config setting is on', () => {
    const sources = resolveScheduleSources({...baseFilterSettings, showOpenLfgs: true});
    expect(sources).toEqual(new Set(['officialEvents', 'privateEvents', 'lfgOpen']));
  });

  it('never defaults to Owned LFGs, since they already arrive via Joined LFGs', () => {
    const sources = resolveScheduleSources({...baseFilterSettings, showJoinedLfgs: true, showOpenLfgs: true});
    expect(sources.has('lfgOwned')).toBe(false);
  });

  it('returns the explicit selection verbatim, ignoring config defaults', () => {
    const sources = resolveScheduleSources({
      ...baseFilterSettings,
      eventSources: ['lfgOwned'],
      showJoinedLfgs: true,
      showOpenLfgs: true,
    });
    expect(sources).toEqual(new Set(['lfgOwned']));
  });
});

describe('buildScheduleList', () => {
  it('returns favorite events of a specific type only (the #458 case: refinements intersect)', () => {
    const events = [
      makeEvent({eventID: 'favorite-shadow', isFavorite: true, eventType: 'Shadow Event'}),
      makeEvent({eventID: 'favorite-gaming', isFavorite: true, eventType: 'Gaming'}),
      makeEvent({eventID: 'unfavorited-shadow', isFavorite: false, eventType: 'Shadow Event'}),
    ];
    const result = buildScheduleList(
      {...baseFilterSettings, eventSources: ['officialEvents'], eventFavoriteFilter: true, eventTypeFilter: 'shadow'},
      undefined,
      undefined,
      undefined,
      events,
      undefined,
    );
    expect(result.map(item => ('eventID' in item ? item.eventID : item.fezID))).toEqual(['favorite-shadow']);
  });

  it('returns a source unfiltered when it has no active refinements', () => {
    const events = [makeEvent({eventID: 'a'}), makeEvent({eventID: 'b', isFavorite: true})];
    const result = buildScheduleList(
      {...baseFilterSettings, eventSources: ['officialEvents']},
      undefined,
      undefined,
      undefined,
      events,
      undefined,
    );
    expect(result).toHaveLength(2);
  });

  it('intersects event type and photographer status rather than unioning them', () => {
    const events = [
      makeEvent({
        eventID: 'gaming-needs-photog',
        eventType: 'Gaming',
        shutternautData: {needsPhotographer: true, photographers: [], userIsPhotographer: false},
      }),
      makeEvent({
        eventID: 'dining-needs-photog',
        eventType: 'Dining',
        shutternautData: {needsPhotographer: true, photographers: [], userIsPhotographer: false},
      }),
      makeEvent({
        eventID: 'gaming-has-photog',
        eventType: 'Gaming',
        shutternautData: {
          needsPhotographer: false,
          photographers: [{userID: 'u', username: 'u'}],
          userIsPhotographer: false,
        },
      }),
    ];
    const result = buildScheduleList(
      {
        ...baseFilterSettings,
        eventSources: ['officialEvents'],
        eventTypeFilter: 'gaming',
        eventShutternautFilter: 'needsPhotographer',
      },
      undefined,
      undefined,
      undefined,
      events,
      undefined,
    );
    expect(result.map(item => ('eventID' in item ? item.eventID : item.fezID))).toEqual(['gaming-needs-photog']);
  });

  it('excludes events entirely when Events is not a selected source', () => {
    const events = [makeEvent({eventID: 'a'})];
    const result = buildScheduleList(
      {...baseFilterSettings, eventSources: ['privateEvents']},
      undefined,
      undefined,
      undefined,
      events,
      undefined,
    );
    expect(result).toHaveLength(0);
  });

  it('unions multiple sources and dedupes Joined/Owned LFG overlap (first occurrence wins)', () => {
    const sharedFez = makeFez({fezID: 'shared', startTime: '2026-01-01T10:00:00Z'});
    const joined = makePage([sharedFez]);
    const owned = makePage([{...sharedFez, title: 'Should be shadowed by joined copy'}]);
    const result = buildScheduleList(
      {...baseFilterSettings, eventSources: ['lfgJoined', 'lfgOwned']},
      joined,
      owned,
      undefined,
      undefined,
      undefined,
    );
    expect(result).toHaveLength(1);
    expect((result[0] as FezData).title).toBe('Test Fez');
  });

  it('does not apply a client-side predicate for unread private events (handled server-side via onlyNew)', () => {
    const personal = makePage([makeFez({fezID: 'p1', fezType: 'personalEvent' as FezData['fezType']})]);
    const result = buildScheduleList(
      {...baseFilterSettings, eventSources: ['privateEvents'], eventPersonalUnreadFilter: true},
      undefined,
      undefined,
      undefined,
      undefined,
      personal,
    );
    expect(result).toHaveLength(1);
  });

  it('sorts by startTime and breaks ties personal-events-first, then events, then LFGs', () => {
    const tiedTime = '2026-01-01T12:00:00Z';
    const personal = makePage([makeFez({fezID: 'personal', startTime: tiedTime})]);
    const lfg = makePage([makeFez({fezID: 'lfg', startTime: tiedTime})]);
    const events = [makeEvent({eventID: 'event', startTime: tiedTime})];
    const result = buildScheduleList(
      {...baseFilterSettings, eventSources: ['officialEvents', 'privateEvents', 'lfgJoined']},
      lfg,
      undefined,
      undefined,
      events,
      personal,
    );
    expect(result.map(item => ('eventID' in item ? item.eventID : item.fezID))).toEqual(['personal', 'event', 'lfg']);
  });
});
