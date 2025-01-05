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
import {CruiseDayData, CruiseDayTime, StartEndTime} from './Types';
import moment from 'moment-timezone';
import pluralize from 'pluralize';
import {StartTime} from './Types/FormValues.ts';

// https://github.com/catamphetamine/javascript-time-ago/issues/9
// Used to be in App.tsx then I moved here so that tests would work.
import TimeAgo from 'javascript-time-ago';
import en from 'javascript-time-ago/locale/en';
TimeAgo.addDefaultLocale(en);

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
    cruiseDays.push(getCruiseDayData(startDate, i + 1));
    cruiseDayNameIndex += 1;
  }

  return cruiseDays;
};

/**
 * Get CruiseDayData for the current day. In Swiftarr we use cruiseday a bit inconsistently.
 * Events and PersonalEvents index starting at 1 (embarkation day) whereas LFGs index starting
 * at 0 (embarkation day). Regardless this should take a day index.
 * @param startDate
 * @param cruiseDayIndex 1-indexed (Event-style) index of the day of the week.
 */
export const getCruiseDayData = (startDate: Date, cruiseDayIndex: number): CruiseDayData => {
  return {
    cruiseDay: cruiseDayIndex,
    date: addDays(startDate, cruiseDayIndex - 1),
  };
};

/**
 * Lifted from https://github.com/jocosocial/swiftarr/blob/70d83bc65e1a70557e6eb12ed941ea01973aca27/Sources/App/Resources/Assets/js/swiftarr.js#L470
 * We somewhat arbitrarily pick 3:00AM boat time as the breaker for when days roll over. But really it just serves as a
 * point in time that we can do maths again.
 * For example: An event at 05:00UTC (00:00EST aka Midnight) will be adjusted backwards three hours (02:00UTC, 21:00EST)
 * and if the client is in EST will result in a return value of 1260 (21 hours * 60 minutes, plus 00 minutes).
 * @TODO this has a bug with events schedule between 00:00-03:00UTC on embarkation day
 * @TODO behavior gets weird with DST, seems to work but eeek.
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
  // Day index of the cruiseStartDate, an integer 0 (Sunday) through 6 (Saturday).
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

  return {
    // .getHours() and .getMinutes() return in local time.
    dayMinutes: adjustedDate.getHours() * 60 + adjustedDate.getMinutes(),
    cruiseDay: cruiseDay,
  };
};

/**
 * Returns a formatted string with the time and time zone.
 * @param dateTimeStr ISO time string.
 * @param timeZoneID The common ID string of a timezone (such as "America/New_York")
 */
export const getTimeMarker = (dateTimeStr: string, timeZoneID: string) => {
  const formattedTime = getBoatTimeMoment(dateTimeStr, timeZoneID).format('hh:mm A');
  return `${formattedTime} ${moment.tz(timeZoneID).zoneAbbr()}`;
};

/**
 * Generate an arbitrary time marker for a given moment (date + timezone). This is used
 * to determine whether to show a spacer between two events in a list.
 * @param dateTimeStr String of the Date.
 * @param timeZoneID String of the Time Zone ID.
 */
export const getDayMarker = (dateTimeStr?: string, timeZoneID?: string) => {
  if (!dateTimeStr || !timeZoneID) {
    return;
  }
  return getBoatTimeMoment(dateTimeStr, timeZoneID).format('dddd MMM Do');
};

/**
 * Returns a formatted string of the start and end times of an event, factoring in the apparent time zone.
 * In the event we cannot form a formatted string then we return empty string so that clients can
 * do a False-y check on whether to render something or not.
 * @param startTimeStr Start ISO string.
 * @param endTimeStr End ISO string.
 * @param timeZoneID 3-letter abbreviation of the timezone.
 * @param includeDay Include the day in the formatted string.
 */
export const getDurationString = (
  startTimeStr?: string,
  endTimeStr?: string,
  timeZoneID?: string,
  includeDay: boolean = false,
) => {
  if (!startTimeStr || !endTimeStr || !timeZoneID) {
    return '';
  }
  const endFormat = 'hh:mm A';
  const startFormat = includeDay ? 'ddd MMM D hh:mm A' : endFormat;
  const startDate = moment(startTimeStr);
  const endDate = moment(endTimeStr);
  const startText = startDate.tz(timeZoneID).format(startFormat);
  const endText = endDate.tz(timeZoneID).format(endFormat);
  return `${startText} - ${endText} ${moment.tz(timeZoneID).zoneAbbr()}`;
};

export const getEventTimeString = (startTimeStr?: string, timeZoneID?: string) => {
  if (!startTimeStr || !timeZoneID) {
    return '';
  }
  const startFormat = 'ddd MMM D hh:mm A';
  const startDate = moment(startTimeStr);
  const text = startDate.tz(timeZoneID).format(startFormat);
  return `${text} ${moment.tz(timeZoneID).zoneAbbr()}`;
};

export const getBoatTimeMoment = (dateTimeStr: string, timeZoneID: string) => {
  const date = moment(dateTimeStr);
  return date.tz(timeZoneID);
};

/**
 * Calculate the minute offset between two time zones at a given date.
 * Positive means towards UTC (going into the future), negative means
 * away from UTC (going into the past).
 * @param originTimeZoneID Time zone you feel like you're in all the time.
 * @param compareTimeZoneID Time zone of the reference date.
 * @param compareDateStr The reference date.
 */
export const getTimeZoneOffset = (originTimeZoneID: string, compareTimeZoneID: string, compareDateStr: string) => {
  let offset = 0;

  // Get the time in both time zones
  const originTime = moment(compareDateStr).tz(originTimeZoneID);
  const compareTime = moment(compareDateStr).tz(compareTimeZoneID);

  // Calculate the minute offset. Positive means towards UTC (going into the future),
  // negative means away from UTC (going into the past).
  offset = compareTime.utcOffset() - originTime.utcOffset();
  return offset;
};

/**
 * Takes a number of minutes as input and returns a human-compatible string of that duration.
 * For example: 30 -> 30 Minutes, 90 -> 1 hour 30 minutes.
 * ChatGPT wrote the base, I made some modifications.
 * @param minutes Number of minutes
 * @TODO replace this with https://www.npmjs.com/package/humanize-duration
 */
export const formatMinutesToHumanReadable = (minutes: number) => {
  const duration = moment.duration(minutes, 'minutes');
  const hours = duration.hours();
  const minutesRemainder = duration.minutes();

  let formattedString = '';

  if (hours > 0) {
    formattedString += `${hours} ${pluralize('hour', hours)}`;
  }

  if (minutesRemainder > 0) {
    formattedString += ` ${minutesRemainder} ${pluralize('minute', minutesRemainder)}`;
  }

  return formattedString.trim();
};

/**
 * Calculate the number of minutes of offset exist between the events scheduled time
 * and what the API reports the event to be at.
 * This is a convenience wrapper since startTime and timeZoneID are optional on a number
 * of objects from the API.
 * @param originTimeZoneID The Port Time Zone ID such as "America/New_York".
 * @param startTime String of the starting time of the event.
 * @param timeZoneID Time zone of the event such as "America/New_York".
 */
export const getEventTimezoneOffset = (originTimeZoneID: string, startTime?: string, timeZoneID?: string) => {
  if (startTime && timeZoneID) {
    return getTimeZoneOffset(originTimeZoneID, timeZoneID, startTime);
  }
  return 0;
};

// Formatter for relative time
export const timeAgo = new TimeAgo('en-US');

/**
 * ChatGPT based on the useDateTime above.
 * This only updates every n minutes, not on the nth minute.
 * @deprecated
 */
export const useRefreshingDate = (minutes: number = 5) => {
  const [lastRefresh, setLastRefresh] = useState(new Date());

  useEffect(() => {
    const intervalId = setInterval(() => {
      // Trigger a state refresh every 15 minutes
      setLastRefresh(new Date());
    }, minutes * 60 * 1000); // 15 minutes in milliseconds

    // Clear the interval on component unmount
    return () => clearInterval(intervalId);
  }, [minutes]); // Empty dependency array ensures the effect runs only once on mount

  return lastRefresh;
};

/**
 * Returns a Date() that pretends like we're on the sailing. Basically takes
 * "today" and transposes it to the sailing week based on the cruise startDate.
 * @param startDate Start Date() of the cruise.
 * @param adjustedCruiseDayToday Day index of the cruise.
 */
export const getApparentCruiseDate = (startDate: Date, adjustedCruiseDayToday: number) => {
  const apparentCruiseDate = new Date(startDate);
  apparentCruiseDate.setDate(startDate.getDate() + (adjustedCruiseDayToday - 1));
  return apparentCruiseDate;
};

/**
 * The DatePickerModal returns a Date with the time component set to 23:59:59.999Z
 * The TimePickerModal stores its data in another field which is then smashed together
 * with the DatePickerModal and Duration values to form the start and end dates.
 * Leaving the extra precision in there is a problem for things that expect the
 * schedule item to start on the whole minute. This function is a wrapper around
 * this smashing.
 * @param startDate Arbitrary precision Date with the starting Date of the schedule.
 * @param startTime Object containing the hours and minutes that the thing starts.
 * @param duration How long the thing is.
 */
export const getScheduleItemStartEndTime = (
  startDate: Date | string,
  startTime: StartTime,
  duration: string | number,
): StartEndTime => {
  let eventStartTime = new Date(startDate);
  eventStartTime.setHours(startTime.hours);
  eventStartTime.setMinutes(startTime.minutes);
  eventStartTime.setSeconds(0);
  eventStartTime.setMilliseconds(0);

  let eventEndTime = addMinutes(eventStartTime, Number(duration));
  return {startTime: eventStartTime, endTime: eventEndTime};
};
