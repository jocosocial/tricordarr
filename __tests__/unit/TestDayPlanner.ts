jest.mock('#src/Enums/FezType', () => ({
  FezType: {},
}));

import moment from 'moment-timezone';

import {DAY_PLANNER_CONFIG, getMinutesFromDayStartForNow} from '#src/Libraries/DayPlanner';

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
