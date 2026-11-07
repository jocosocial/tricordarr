jest.mock('#src/Enums/FezType', () => ({
  FezType: {},
}));

import moment from 'moment-timezone';

import {DAY_PLANNER_CONFIG} from '#src/Context/Contexts/DayPlannerContext';
import {
  calculateItemLayout,
  getItemsTimelineWindow,
  getMinutesFromDayStartForNow,
} from '#src/Context/Providers/DayPlannerProvider';
import {DayPlannerItem} from '#src/Types/DayPlanner';

describe('getMinutesFromDayStartForNow', () => {
  const boatTz = 'America/Lower_Princes';
  const dayStart = moment.tz('2025-03-06 03:00', boatTz).toDate();
  const dayMinutesMax = DAY_PLANNER_CONFIG.TOTAL_HOURS * 60;

  it('uses boat timezone wall-clock, not device local', () => {
    // 10:36 AST with a 03:00 AST day start → 7h 36m = 456 minutes.
    // 10:36 AST is 14:36 UTC; device-local getHours() in UTC would yield 696.
    const now = moment.tz('2025-03-06 10:36', boatTz).toDate();
    expect(getMinutesFromDayStartForNow(boatTz, dayStart, now)).toBe(456);
  });

  it('wraps times before day start into the late-day-flip window', () => {
    // 02:00 AST is 23 hours after 03:00 (3AM–3AM displayed day).
    const now = moment.tz('2025-03-07 02:00', boatTz).toDate();
    expect(getMinutesFromDayStartForNow(boatTz, dayStart, now)).toBe(23 * 60);
  });

  it('keeps the last minute of the 24-hour window in range', () => {
    const now = moment.tz('2025-03-07 02:59', boatTz).toDate();
    expect(getMinutesFromDayStartForNow(boatTz, dayStart, now)).toBe(dayMinutesMax - 1);
  });

  it('returns 0 at day start', () => {
    const now = moment.tz('2025-03-06 03:00', boatTz).toDate();
    expect(getMinutesFromDayStartForNow(boatTz, dayStart, now)).toBe(0);
  });
});

describe('getItemsTimelineWindow', () => {
  const tz = 'America/Lower_Princes';
  const at = (value: string) => moment.tz(value, tz).toDate();
  const makeItem = (id: string, start: string, end: string, title = id): DayPlannerItem => ({
    id,
    title,
    startTime: at(start),
    endTime: at(end),
    type: 'event',
    color: 'schedule',
  });
  const windowOf = (items: DayPlannerItem[], compact?: boolean) => {
    const result = getItemsTimelineWindow(items, tz, compact);
    return result && {start: result.dayStart.getTime(), end: result.dayEnd.getTime()};
  };

  it('returns null for no items', () => {
    expect(getItemsTimelineWindow([], tz)).toBeNull();
  });

  it('floors the start to the hour and ceils a partial-hour end to the next hour', () => {
    expect(windowOf([makeItem('a', '2025-03-06 06:20', '2025-03-06 07:30')])).toEqual({
      start: at('2025-03-06 06:00').getTime(),
      end: at('2025-03-06 08:00').getTime(),
    });
  });

  it('keeps an end that is already on the hour', () => {
    expect(windowOf([makeItem('a', '2025-03-06 06:20', '2025-03-06 08:00')])).toEqual({
      start: at('2025-03-06 06:00').getTime(),
      end: at('2025-03-06 08:00').getTime(),
    });
  });

  it('spans items past the old 3AM day boundary', () => {
    const items = [
      makeItem('a', '2025-03-07 02:30', '2025-03-07 03:30'),
      makeItem('b', '2025-03-07 03:15', '2025-03-07 04:00'),
    ];
    expect(windowOf(items)).toEqual({
      start: at('2025-03-07 02:00').getTime(),
      end: at('2025-03-07 04:00').getTime(),
    });
  });

  it('extends a short last item so its minimum-height card fits', () => {
    expect(windowOf([makeItem('a', '2025-03-06 10:00', '2025-03-06 10:15')])).toEqual({
      start: at('2025-03-06 10:00').getTime(),
      end: at('2025-03-06 11:00').getTime(),
    });
  });

  it('measures long Theme events at their compact duration when compacting', () => {
    const items = [makeItem('t', '2025-03-06 08:00', '2025-03-06 20:00', 'Theme: Pajama Day')];
    expect(windowOf(items, true)).toEqual({
      start: at('2025-03-06 08:00').getTime(),
      end: at('2025-03-06 10:00').getTime(),
    });
    expect(windowOf(items, false)).toEqual({
      start: at('2025-03-06 08:00').getTime(),
      end: at('2025-03-06 20:00').getTime(),
    });
  });
});

describe('calculateItemLayout pinned item', () => {
  const tz = 'America/Lower_Princes';
  const at = (value: string) => moment.tz(`2025-03-06 ${value}`, tz).toDate();
  const makeItem = (id: string, start: string, end: string): DayPlannerItem => ({
    id,
    title: id,
    startTime: at(start),
    endTime: at(end),
    type: 'event',
    color: 'schedule',
  });
  const columnsOf = (items: DayPlannerItem[], pinnedItemId?: string) => {
    const layout = calculateItemLayout(items, at('08:00'), at('20:00'), false, pinnedItemId);
    return Object.fromEntries(layout.map(item => [item.id, item.columnIndex]));
  };
  const earlier = makeItem('earlier', '10:00', '11:00');
  const pinned = makeItem('pinned', '10:30', '11:30');
  const later = makeItem('later', '11:00', '12:00');

  it('assigns columns by start time without a pinned item', () => {
    expect(columnsOf([earlier, pinned, later])).toEqual({earlier: 0, pinned: 1, later: 0});
  });

  it('keeps the pinned item in the first column when another item starts before it', () => {
    expect(columnsOf([earlier, pinned, later], 'pinned')).toEqual({earlier: 1, pinned: 0, later: 1});
  });

  it('keeps the pinned item first when an overlapping item has the same start', () => {
    const sameStart = makeItem('sameStart', '10:30', '11:00');
    expect(columnsOf([sameStart, pinned], 'pinned')).toEqual({sameStart: 1, pinned: 0});
  });

  it('still lets items outside the pinned item use the first column', () => {
    const before = makeItem('before', '09:00', '10:00');
    const after = makeItem('after', '11:30', '12:00');
    expect(columnsOf([before, pinned, after], 'pinned')).toEqual({before: 0, pinned: 0, after: 0});
  });

  it('ignores a pinned id that is not displayed', () => {
    expect(columnsOf([earlier, later], 'missing')).toEqual({earlier: 0, later: 0});
  });
});
