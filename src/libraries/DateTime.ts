import {
  differenceInMilliseconds,
  startOfSecond,
  startOfMinute,
  startOfHour,
  startOfDay,
  addSeconds,
  addMinutes,
  addHours,
  addDays,
} from 'date-fns';
import {useEffect, useState, useRef} from 'react';
import {CruiseDayData, CruiseDayTime, ScheduleItem} from './Types';
import moment from 'moment-timezone';
import {EventData} from './Structs/ControllerStructs';
import {EventType} from './Enums/EventType';

const thresholdMap = {
  second: {
    start: startOfSecond,
    add: addSeconds,
  },
  minute: {
    start: startOfMinute,
    add: addMinutes,
  },
  hour: {
    start: startOfHour,
    add: addHours,
  },
  day: {
    start: startOfDay,
    add: addDays,
  },
};

function msUntilNext(threshold: keyof typeof thresholdMap) {
  const {start, add} = thresholdMap[threshold];
  const date = new Date();
  return differenceInMilliseconds(add(start(date), 1), date);
}

function startOfThreshold(threshold: keyof typeof thresholdMap) {
  if (!threshold) {
    return new Date();
  } else {
    return thresholdMap[threshold].start(new Date());
  }
}

/**
 * This was lifted directly from the internet.
 * https://dev.to/dcwither/tracking-time-with-react-hooks-4b8b
 *
 * Make a date object that react-ifys itself and makes it available as a hook.
 */
export default function useDateTime(threshold: keyof typeof thresholdMap) {
  const [date, setDate] = useState(startOfThreshold(threshold));
  const timer = useRef(0);

  useEffect(() => {
    if (threshold) {
      function delayedTimeChange() {
        timer.current = setTimeout(() => {
          delayedTimeChange();
        }, msUntilNext(threshold));

        setDate(startOfThreshold(threshold));
      }

      delayedTimeChange();
      return () => clearTimeout(timer.current);
    }
  }, [threshold]);

  return date;
}

/**
  Determine the "virtual day index of the cruise". For example: Let's say today is Sunday Oct 22 2023, long after
  the actual 2023 cruise. We want to simulate that today is actually the "1st day of the cruise" (cruiseday=1).
  Sunday is 0 in JavaScript date-fns, 1 in Swift.
  https://github.com/jocosocial/swiftarr/blob/70d83bc65e1a70557e6eb12ed941ea01973aca27/Sources/App/Site/SiteEventsController.swift#L144-L149
 */
export const getCruiseDay: (today: Date, cruiseStartDayOfWeek: number) => number = (
  today: Date,
  cruiseStartDayOfWeek: number,
) => {
  // Map the day of the week to a number.
  const weekday = today.getDay();
  // Do maths. We add an extra 1 to the weekday and cruiseStartDayOfWeek because Swift and JavaScript assign values differently.
  return ((7 + (weekday + 1) - (cruiseStartDayOfWeek + 1)) % 7) + 1;
};

export const getCruiseDays = (startDate: Date, cruiseLength: number) => {
  let cruiseDayNameIndex = startDate.getDay();
  let cruiseDays: CruiseDayData[] = [];
  for (let i = 0; i < cruiseLength; i++) {
    if (cruiseDayNameIndex > 6) {
      cruiseDayNameIndex -= 7;
    }
    cruiseDays.push({
      cruiseDay: i + 1,
      date: addDays(startDate, i),
    });
    cruiseDayNameIndex += 1;
  }

  return cruiseDays;
};

/**
 * Lifted from https://github.com/jocosocial/swiftarr/blob/70d83bc65e1a70557e6eb12ed941ea01973aca27/Sources/App/Resources/Assets/js/swiftarr.js#L470
 * We somewhat arbitrarily pick 3:00AM boat time as the breaker for when days roll over. But really it just serves as a
 * point in time that we can do maths again.
 * For example: An event at 05:00UTC (00:00EST aka Midnight) will be adjusted forward three hours (02:00UTC, 21:00EST)
 * and if the client is in EST will result in a return value of 1260 (21 hours * 60 minutes, plus 00 minutes).
 * @param dateValue
 * @param cruiseStartDate
 * @param cruiseEndDate
 */
export const calcCruiseDayTime: (dateValue: Date, cruiseStartDate: Date, cruiseEndDate: Date) => CruiseDayTime = (
  dateValue: Date,
  cruiseStartDate: Date,
  cruiseEndDate: Date,
) => {
  // Subtract 3 hours so the 'day' divider for events is 3AM. NOT doing timezone math here.
  let adjustedDate = new Date(dateValue.getTime() - 3 * 60 * 60 * 1000);

  let cruiseStartDay = cruiseStartDate.getDay();
  // Hackish. StartDate is midnight EST, which makes getDay return the day before in [PCM]ST.
  if (cruiseStartDate.getHours() > 12) {
    cruiseStartDay = (cruiseStartDay + 1) % 7;
  }
  let cruiseDay = (7 - cruiseStartDay + adjustedDate.getDay()) % 7;
  if (adjustedDate >= cruiseStartDate && adjustedDate < cruiseEndDate) {
    cruiseDay = Math.trunc((adjustedDate.getTime() - cruiseStartDate.getTime()) / (1000 * 60 * 60 * 24));
  }
  // To avoid confusion, the term "cruiseday" refers to "the nth day of the cruise" (1st, 2nd, 8th...).
  cruiseDay += 1;
  // console.log(new Date().getHours() - 3, adjustedDate.getHours());

  return {
    // .getHours() and .getMinutes() return in local time.
    dayMinutes: adjustedDate.getHours() * 60 + adjustedDate.getMinutes(),
    cruiseDay: cruiseDay,
  };
};

/**
 * Returns a formatted string with the time and time zone.
 * @param dateTimeStr ISO time string.
 * @param timeZoneAbbrStr 3-letter abbreviation of the timezone. @TODO there is a hack in place for AST in App.ts.
 */
export const getTimeMarker = (dateTimeStr: string, timeZoneAbbrStr: string) => {
  const formattedTime = getBoatTimeMoment(dateTimeStr, timeZoneAbbrStr).format('hh:mm A');
  return `${formattedTime} ${timeZoneAbbrStr}`;
};

/**
 * Returns a formatted string of the start and end times of an event, factoring in the apparent time zone.
 * @param startTimeStr Start ISO string.
 * @param endTimeStr End ISO string.
 * @param timeZoneAbbrStr 3-letter abbreviation of the timezone.
 * @param includeDay Include the day in the formatted string.
 */
export const getDurationString = (startTimeStr: string, endTimeStr: string, timeZoneAbbrStr: string, includeDay: boolean) => {
  const format = includeDay ? 'ddd MMM D hh:mm A' : 'hh:mm A';
  const startDate = moment(startTimeStr);
  const endDate = moment(endTimeStr);
  const startText = startDate.tz(timeZoneAbbrStr).format(format);
  const endText = endDate.tz(timeZoneAbbrStr).format(format);
  return `${startText} - ${endText}`;
};

// export const getTimeZoneOffset = (originTimeZoneID: string, compareTimeZoneAbbr: string, compareDateStr: string) => {
//   let offset = 0;
//
//   // @TODO this is a hack until we can reveal the time zones via the API.
//   let compareTimeZoneID = 'America/New_York';
//   switch (compareTimeZoneAbbr) {
//     case 'AST':
//       compareTimeZoneID = 'America/Santo_Domingo';
//       break;
//     case 'EST':
//       compareTimeZoneID = 'America/New_York';
//       break;
//   }
//
//   // Get the time in both time zones
//   const originTime = moment(compareDateStr).tz(originTimeZoneID);
//   const compareTime = moment(compareDateStr).tz(compareTimeZoneID);
//
//   // Calculate the minute offset. Positive means towards UTC (going into the future),
//   // negative means away from UTC (going into the past).
//   offset = compareTime.utcOffset() - originTime.utcOffset();
//   // if (offset !== 0) {
//   //   console.log('Time zone offset is', offset);
//   // }
//   return offset;
// };

export const getBoatTimeMoment = (dateTimeStr: string, timeZoneAbbrStr: string) => {
  const date = moment(dateTimeStr);
  return date.tz(timeZoneAbbrStr);
};

export const eventToItem = (event: EventData): ScheduleItem => {
  return {
    title: event.title,
    startTime: event.startTime,
    endTime: event.endTime,
    timeZone: event.timeZone,
    location: event.location,
    itemType: (event.eventType === EventType.shadow ? 'shadow' : 'official'),
  };
};

export const getTimeZoneOffset = (originTimeZoneID: string, compareTimeZoneAbbr: string, compareDateStr: string) => {
  let offset = 0;

  // @TODO this is a hack until we can reveal the time zones via the API.
  let compareTimeZoneID = 'America/New_York';
  switch (compareTimeZoneAbbr) {
    case 'AST':
      compareTimeZoneID = 'America/Santo_Domingo';
      break;
    case 'EST':
      compareTimeZoneID = 'America/New_York';
      break;
  }

  // Get the time in both time zones
  const originTime = moment(compareDateStr).tz(originTimeZoneID);
  const compareTime = moment(compareDateStr).tz(compareTimeZoneID);

  // Calculate the minute offset. Positive means towards UTC (going into the future),
  // negative means away from UTC (going into the past).
  offset = compareTime.utcOffset() - originTime.utcOffset();
  return offset;
};
