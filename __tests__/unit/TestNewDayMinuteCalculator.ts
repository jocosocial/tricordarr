import {parseISO} from 'date-fns';

/**
 * Calculate the number of minutes into a day that a given date is.
 * For the purposes of Swiftarr scheduling, days start at Midnight
 * and end at 3AM on the next day.
 *
 * Warning: getHours() will automatically adjust if there is a DST
 * shift on the given dateValue. This "should" be OK since the app
 * will be internally consistent.
 *
 * This is now abandonware. I fixed the bug I was having so this is
 * going to snooze until some day when I maybe need it again.
 * @param dateValue
 */
const calcDayMinutes = (dateValue: Date) => {
  const numMinutes = dateValue.getHours() * 60 + dateValue.getMinutes();
  return numMinutes;
};

describe('calcDayMinutes', () => {
  it('Midnight Day Of', () => {
    const testDate = parseISO('2024-03-09T05:00:00.000Z');
    const result = calcDayMinutes(testDate);
    expect(result).toEqual(0);
  });

  it('1:50AM Day Of', () => {
    const testDate = parseISO('2024-03-09T06:50:00.000Z');
    const result = calcDayMinutes(testDate);
    expect(result).toEqual(110);
  });

  it('Noon', () => {
    const testDate = parseISO('2024-03-09T17:00:00.000Z');
    const result = calcDayMinutes(testDate);
    expect(result).toEqual(720);
  });

  it('7:00PM', () => {
    const testDate = parseISO('2024-03-10T00:00:00.000Z');
    const result = calcDayMinutes(testDate);
    expect(result).toEqual(1140);
  });

  it('Midnight Next Day', () => {
    const testDate = parseISO('2024-03-10T05:00:00.000Z');
    const result = calcDayMinutes(testDate);
    expect(result).toEqual(1440);
  });

  it('2:59AM Next Day', () => {
    const testDate = parseISO('2024-03-10T07:59:00.000Z');
    const result = calcDayMinutes(testDate);
    expect(result).toEqual(1619);
  });
});
