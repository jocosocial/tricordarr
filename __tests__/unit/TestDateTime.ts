import {calcCruiseDayTime} from '../../src/libraries/DateTime.ts';

describe('calcCruiseDayTime', () => {
  const cruiseStartDate = new Date('2024-03-09T05:00:00.000Z');
  const cruiseEndDate = new Date('2024-03-16T04:00:00.000Z');

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
    const result = calcCruiseDayTime(new Date('2024-03-09T06:00:00.000Z'), cruiseStartDate, cruiseEndDate);
    expect(result).toEqual({
      dayMinutes: 1320, // 22 hours * 60 minutes
      cruiseDay: 7,
    });
  });

  // 07:00 UTC-4 (3AM EDT) == rollover point
  it('7AM UTC-4 event on day three (sailing)', () => {
    const result = calcCruiseDayTime(new Date('2024-03-11T11:00:00.000Z'), cruiseStartDate, cruiseEndDate);
    expect(result).toEqual({
      dayMinutes: 240, // 4 hours * 60 minutes
      cruiseDay: 3,
    });
  });

  it('2AM UTC-5 event on day three (sailing)', () => {
    // const testDate = new Date('2024-03-11T07:00:00.000Z');
    const testDate = new Date('2024-03-10T07:00:00.000Z');
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
