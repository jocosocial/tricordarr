import {TimeZoneLabelMode} from '#src/Enums/TimeZoneLabelMode';
import {calcCruiseDayTime, getDurationString, getTimeZoneLabel} from '#src/Libraries/DateTime';

describe('calcCruiseDayTime', () => {
  const cruiseStartDate = new Date('2025-03-02T05:00:00.000Z');
  const cruiseEndDate = new Date('2025-03-09T04:00:00.000Z');

  // This rolls back to the disembarkation cruiseDay.
  // 08:00 UTC 03:00AM EST == 0
  // 09:00 UTC 04:00AM EST == 60
  // 10:00 UTC 05:00AM EST == 120
  // 11:00 UTC 06:00AM EST == 180
  // 12:00 UTC 07:00AM EST == 240
  // 13:00 UTC 08:00AM EST == 300
  // 14:00 UTC 09:00AM EST == 360
  // 15:00 UTC 10:00AM EST == 420
  // 16:00 UTC 11:00AM EST == 480
  // 17:00 UTC 12:00AM EST == 540
  // 18:00 UTC 01:00PM EST == 600
  // 19:00 UTC 02:00PM EST == 660
  // 20:00 UTC 03:00PM EST == 720
  // 21:00 UTC 04:00PM EST == 780
  // 22:00 UTC 05:00PM EST == 840
  // 23:00 UTC 06:00PM EST == 900
  // 00:00 UTC 07:00PM EST == 960
  // 01:00 UTC 08:00PM EST == 1020
  // 02:00 UTC 09:00PM EST == 1080
  // 03:00 UTC 10:00PM EST == 1140
  // 04:00 UTC 11:00PM EST == 1200
  // 05:00 UTC 12:00AM EST == 1260
  // 06:00 UTC 01:00AM EST == 1320
  // 07:00 UTC 02:00AM EST == 1380

  it('1AM UTC-5 event on day one (embarkation)', () => {
    const result = calcCruiseDayTime(new Date('2025-03-02T06:00:00.000Z'), cruiseStartDate, cruiseEndDate);
    expect(result).toEqual({
      dayMinutes: 1320, // 22 hours * 60 minutes
      cruiseDay: 1,
    });
  });

  // 07:00 UTC-4 (3AM EDT) == rollover point
  it('7AM UTC-4 event on day three (sailing)', () => {
    const result = calcCruiseDayTime(new Date('2025-03-04T11:00:00.000Z'), cruiseStartDate, cruiseEndDate);
    expect(result).toEqual({
      dayMinutes: 240, // 4 hours * 60 minutes
      cruiseDay: 3,
    });
  });

  it('2AM UTC-5 event on day three (sailing)', () => {
    // const testDate = new Date('2024-03-11T07:00:00.000Z');
    const testDate = new Date('2025-03-04T07:00:00.000Z');
    let adjustedDate = new Date(testDate.getTime() - 3 * 60 * 60 * 1000);
    const result = calcCruiseDayTime(testDate, cruiseStartDate, cruiseEndDate);
    expect(result).toEqual({
      dayMinutes: 1380, // 23 hours * 60 minutes
      cruiseDay: 2,
      testDate: testDate,
      adjustedDate: adjustedDate,
      mins: adjustedDate.getHours(),
    });
  });
});

describe('getTimeZoneLabel', () => {
  const winterNy = '2025-01-15T17:00:00.000Z';
  const summerNy = '2025-07-15T16:00:00.000Z';
  const kolkataNoon = '2025-06-15T06:30:00.000Z';
  const utcNoon = '2025-06-15T12:00:00.000Z';

  it('formats whole-hour offsets without minutes', () => {
    expect(getTimeZoneLabel('America/New_York', winterNy, TimeZoneLabelMode.offset)).toEqual('GMT-5');
    expect(getTimeZoneLabel('UTC', utcNoon, TimeZoneLabelMode.offset)).toEqual('GMT+0');
  });

  it('includes minutes for fractional offsets', () => {
    expect(getTimeZoneLabel('Asia/Kolkata', kolkataNoon, TimeZoneLabelMode.offset)).toEqual('GMT+5:30');
  });

  it('returns localized abbreviations at the event instant', () => {
    expect(getTimeZoneLabel('America/New_York', winterNy, TimeZoneLabelMode.abbreviation)).toEqual('EST');
    expect(getTimeZoneLabel('America/New_York', summerNy, TimeZoneLabelMode.abbreviation)).toEqual('EDT');
  });

  it('returns an empty string when hidden', () => {
    expect(getTimeZoneLabel('America/New_York', winterNy, TimeZoneLabelMode.hidden)).toEqual('');
  });

  it('uses the event instant for DST, not the current time', () => {
    expect(getTimeZoneLabel('America/New_York', winterNy, TimeZoneLabelMode.offset)).toEqual('GMT-5');
    expect(getTimeZoneLabel('America/New_York', summerNy, TimeZoneLabelMode.offset)).toEqual('GMT-4');
  });
});

describe('getDurationString', () => {
  const start = '2025-01-15T17:00:00.000Z';
  const end = '2025-01-15T18:00:00.000Z';
  const timeZoneID = 'America/New_York';

  it('appends a GMT offset by default', () => {
    expect(getDurationString(start, end, timeZoneID)).toEqual('12:00 PM - 01:00 PM GMT-5');
  });

  it('appends an abbreviation when requested', () => {
    expect(getDurationString(start, end, timeZoneID, false, TimeZoneLabelMode.abbreviation)).toEqual(
      '12:00 PM - 01:00 PM EST',
    );
  });

  it('omits the timezone label when hidden', () => {
    expect(getDurationString(start, end, timeZoneID, false, TimeZoneLabelMode.hidden)).toEqual('12:00 PM - 01:00 PM');
  });
});
