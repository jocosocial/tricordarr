jest.mock('react-native-encrypted-storage', () => ({
  default: {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
  },
}));

jest.mock('#src/Libraries/Logger', () => ({
  createLogger: () => ({
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  }),
}));

jest.mock('#src/Libraries/Storage', () => ({
  StorageKeys: {},
}));

import moment from 'moment-timezone';

import {calcCruiseDayTime} from '#src/Libraries/DateTime';
import {ClientSettingsData} from '#src/Structs/ControllerStructs';

describe('parseCruiseStartDate', () => {
  it('extracts the correct date-only string from a UTC ISO timestamp', () => {
    const result = ClientSettingsData.parseCruiseStartDate('2025-03-02T05:00:00.000Z');
    expect(result).toBe('2025-03-02');
  });

  it('extracts the UTC date even when UTC hours are late in the day', () => {
    const result = ClientSettingsData.parseCruiseStartDate('2025-03-02T08:00:00.000Z');
    expect(result).toBe('2025-03-02');
  });

  it('extracts the UTC date for midnight UTC', () => {
    const result = ClientSettingsData.parseCruiseStartDate('2025-03-02T00:00:00.000Z');
    expect(result).toBe('2025-03-02');
  });

  it('returns the original string for invalid dates', () => {
    const result = ClientSettingsData.parseCruiseStartDate('not-a-date');
    expect(result).toBe('not-a-date');
  });
});

describe('buildCruiseStartDate', () => {
  it('creates midnight in EST for a date-only string', () => {
    const date = ClientSettingsData.buildCruiseStartDate('2025-03-02', 'America/New_York');
    // March 2 00:00 EST = March 2 05:00 UTC
    expect(date.toISOString()).toBe('2025-03-02T05:00:00.000Z');
  });

  it('creates midnight in AST for a date-only string', () => {
    const date = ClientSettingsData.buildCruiseStartDate('2025-03-02', 'America/Puerto_Rico');
    // March 2 00:00 AST = March 2 04:00 UTC
    expect(date.toISOString()).toBe('2025-03-02T04:00:00.000Z');
  });

  it('produces a consistent absolute time for a given port timezone', () => {
    const date1 = ClientSettingsData.buildCruiseStartDate('2025-03-02', 'America/New_York');
    const date2 = ClientSettingsData.buildCruiseStartDate('2025-03-02', 'America/New_York');
    expect(date1.getTime()).toBe(date2.getTime());
    expect(date1.toISOString()).toBe('2025-03-02T05:00:00.000Z');
  });
});

describe('parseCruiseStartDate + buildCruiseStartDate round-trip', () => {
  it('server timestamp round-trips through parse + build correctly', () => {
    const serverTimestamp = '2025-03-02T05:00:00.000Z';
    const portTZ = 'America/New_York';

    const dateStr = ClientSettingsData.parseCruiseStartDate(serverTimestamp);
    const date = ClientSettingsData.buildCruiseStartDate(dateStr, portTZ);

    expect(date.toISOString()).toBe('2025-03-02T05:00:00.000Z');
  });

  it('survives JSON serialization round-trip via cruiseStartDateStr', () => {
    const serverTimestamp = '2025-03-02T05:00:00.000Z';
    const portTZ = 'America/New_York';

    const dateStr = ClientSettingsData.parseCruiseStartDate(serverTimestamp);
    const date = ClientSettingsData.buildCruiseStartDate(dateStr, portTZ);

    // Simulate JSON.stringify + JSON.parse (as AsyncStorage does)
    const stored = JSON.stringify({cruiseStartDateStr: dateStr, cruiseStartDate: date});
    const loaded = JSON.parse(stored);

    expect(loaded.cruiseStartDateStr).toBe('2025-03-02');

    // Reconstruct from the date-only string (as getAppConfig does)
    const reconstructed = ClientSettingsData.buildCruiseStartDate(loaded.cruiseStartDateStr, portTZ);
    expect(reconstructed.toISOString()).toBe('2025-03-02T05:00:00.000Z');
  });
});

describe('calcCruiseDayTime TZ-aware path with port-TZ midnight start date', () => {
  // Use buildCruiseStartDate to create the correct absolute time (midnight EST)
  const portTZ = 'America/New_York';
  const cruiseStartDate = ClientSettingsData.buildCruiseStartDate('2025-03-02', portTZ);
  const cruiseEndDate = moment.tz('2025-03-09', 'YYYY-MM-DD', portTZ).toDate();

  const getBoatTzEST = () => 'America/New_York';
  const getBoatTzAST = () => 'America/Puerto_Rico';

  it('10AM EST on embarkation day is cruise day 1 (EST boat TZ)', () => {
    // March 2 10:00 EST = 15:00 UTC
    const eventDate = new Date('2025-03-02T15:00:00.000Z');
    const result = calcCruiseDayTime(eventDate, cruiseStartDate, cruiseEndDate, getBoatTzEST);
    expect(result.cruiseDay).toBe(1);
  });

  it('2AM EST on March 3 is still cruise day 1 (before 3AM rollover)', () => {
    // March 3 02:00 EST = 07:00 UTC
    const eventDate = new Date('2025-03-03T07:00:00.000Z');
    const result = calcCruiseDayTime(eventDate, cruiseStartDate, cruiseEndDate, getBoatTzEST);
    expect(result.cruiseDay).toBe(1);
  });

  it('4AM EST on March 3 is cruise day 2 (after 3AM rollover)', () => {
    // March 3 04:00 EST = 09:00 UTC
    const eventDate = new Date('2025-03-03T09:00:00.000Z');
    const result = calcCruiseDayTime(eventDate, cruiseStartDate, cruiseEndDate, getBoatTzEST);
    expect(result.cruiseDay).toBe(2);
  });

  it('10AM AST on embarkation day is cruise day 1 (AST boat TZ)', () => {
    // March 2 10:00 AST = 14:00 UTC
    const eventDate = new Date('2025-03-02T14:00:00.000Z');
    const result = calcCruiseDayTime(eventDate, cruiseStartDate, cruiseEndDate, getBoatTzAST);
    expect(result.cruiseDay).toBe(1);
  });

  it('2AM AST on March 3 is still cruise day 1 (AST boat TZ, before 3AM rollover)', () => {
    // March 3 02:00 AST = 06:00 UTC
    const eventDate = new Date('2025-03-03T06:00:00.000Z');
    const result = calcCruiseDayTime(eventDate, cruiseStartDate, cruiseEndDate, getBoatTzAST);
    expect(result.cruiseDay).toBe(1);
  });

  it('4AM AST on March 3 is cruise day 2 (AST boat TZ, after 3AM rollover)', () => {
    // March 3 04:00 AST = 08:00 UTC
    const eventDate = new Date('2025-03-03T08:00:00.000Z');
    const result = calcCruiseDayTime(eventDate, cruiseStartDate, cruiseEndDate, getBoatTzAST);
    expect(result.cruiseDay).toBe(2);
  });
});
