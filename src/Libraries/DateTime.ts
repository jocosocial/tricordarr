import {
  addDays,
  addHours,
  addMinutes,
  addSeconds,
  differenceInMilliseconds,
  startOfDay,
  startOfHour,
  startOfMinute,
  startOfSecond,
} from 'date-fns';
import TimeAgo from 'javascript-time-ago';
import en from 'javascript-time-ago/locale/en';
import moment from 'moment-timezone';
import pluralize from 'pluralize';
import {useEffect, useRef, useState} from 'react';
import {AppState} from 'react-native';

import {CruiseDayData, CruiseDayTime, StartEndTime} from '#src/Types';
import {StartTime} from '#src/Types/FormValues';

// https://github.com/catamphetamine/javascript-time-ago/issues/9
// Used to be in App.tsx then I moved here so that tests would work.
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
 *
 * An AppState listener forces an immediate refresh when the app returns to foreground.
 * On iOS/Android, setTimeout callbacks are suspended while the app is backgrounded or
 * the device is asleep, so the recursive timer alone can miss hour boundaries (e.g. the
 * 3 AM lateDayFlip rollover). See https://github.com/jocosocial/tricordarr/issues/282
 */
export default function useDateTime(threshold: keyof typeof thresholdMap) {
  const [date, setDate] = useState(startOfThreshold(threshold));
  const timer = useRef(0);

  useEffect(() => {
    if (threshold) {
      function scheduleNext() {
        clearTimeout(timer.current);
        timer.current = setTimeout(() => {
          scheduleNext();
        }, msUntilNext(threshold));

        setDate(startOfThreshold(threshold));
      }

      scheduleNext();

      // When the app returns from background/sleep, setTimeout callbacks may
      // have been suspended. Force an immediate refresh so the UI catches up.
      const subscription = AppState.addEventListener('change', state => {
        if (state === 'active') {
          scheduleNext();
        }
      });

      return () => {
        clearTimeout(timer.current);
        subscription.remove();
      };
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
 * Calculate the cruise day and day-minutes for a given date/time.
 *
 * When getBoatTzAt is provided, uses timezone-aware day boundaries that follow the ship's actual
 * timezone changes. This fixes DST and late-night edge cases (00:00-03:00 on embarkation day).
 *
 * When getBoatTzAt is not provided, uses the legacy fixed 3-hour offset behavior for backward compatibility.
 *
 * @param dateValue The date/time to compute cruise day for
 * @param cruiseStartDate The start date of the cruise
 * @param cruiseEndDate The end date of the cruise
 * @param getBoatTzAt Optional function to get boat timezone at a given time (e.g., tzAtTime from useTimeZone)
 * @returns CruiseDayTime with cruiseDay (1-indexed) and dayMinutes (minutes since day start, e.g. 3am)
 */
export const calcCruiseDayTime: (
  dateValue: Date,
  cruiseStartDate: Date,
  cruiseEndDate: Date,
  getBoatTzAt?: (date: Date) => string,
) => CruiseDayTime = (dateValue: Date, cruiseStartDate: Date, cruiseEndDate: Date, getBoatTzAt?) => {
  // If getBoatTzAt is provided, use timezone-aware calculation
  if (getBoatTzAt) {
    const boatTz = getBoatTzAt(dateValue);
    const dateInBoatTz = moment(dateValue).tz(boatTz);
    const cruiseStartInBoatTz = moment(cruiseStartDate).tz(boatTz).startOf('day');

    // Day starts at 3am in boat timezone
    const dayStartHour = 3;

    // Calculate which cruise day this is (1-indexed)
    let cruiseDay: number;
    const daysSinceCruiseStart = dateInBoatTz.diff(cruiseStartInBoatTz, 'days');

    // Before 3am we're still in the previous cruise day (0-indexed, += 1 below makes it 1-indexed)
    if (dateInBoatTz.hours() < dayStartHour) {
      cruiseDay = daysSinceCruiseStart - 1;
    } else {
      cruiseDay = daysSinceCruiseStart;
    }

    // Ensure we're within cruise bounds
    if (dateValue < cruiseStartDate) {
      cruiseDay = 0;
    } else if (dateValue >= cruiseEndDate) {
      const totalDays = moment(cruiseEndDate).diff(moment(cruiseStartDate), 'days');
      cruiseDay = totalDays;
    }

    // Add 1 to make it 1-indexed (cruise day 1, 2, 3, etc.)
    cruiseDay += 1;

    // Calculate minutes from day start (3am)
    let dayMinutes = (dateInBoatTz.hours() - dayStartHour) * 60 + dateInBoatTz.minutes();
    // If we're in the 00:00-03:00 window, wrap into the 24-hour day (21:00-24:00 range)
    if (dayMinutes < 0) {
      dayMinutes += 24 * 60;
    }

    return {
      cruiseDay,
      dayMinutes,
    };
  }

  // Legacy behavior: fixed 3-hour offset
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
 * @param includeDay When false, omits the day of week (e.g. "Monday") for single-day views.
 */
export const getTimeMarker = (dateTimeStr: string, timeZoneID: string, includeDay: boolean = true) => {
  const format = includeDay ? 'dddd hh:mm A' : 'hh:mm A';
  const formattedTime = getBoatTimeMoment(dateTimeStr, timeZoneID).format(format);
  return `${formattedTime} ${moment.tz(timeZoneID).zoneAbbr()}`;
};

/**
 * Generate an arbitrary time marker for a given moment (date + timezone). This is used
 * to determine whether to show a spacer between two events in a list.
 * @param dateTimeStr String of the Date.
 * @param timeZoneID String of the Time Zone ID.
 * @param includeDay When false, omits the day of week (e.g. "Monday") for single-day views.
 */
export const getDayMarker = (dateTimeStr?: string, timeZoneID?: string, includeDay: boolean = true) => {
  if (!dateTimeStr || !timeZoneID) {
    return;
  }
  const format = includeDay ? 'dddd MMM Do' : 'MMM Do';
  return getBoatTimeMoment(dateTimeStr, timeZoneID).format(format);
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
 * Return hours and minutes of a Date in a given IANA timezone (e.g. from tzAtTime).
 * Use this instead of date.getHours()/getMinutes() when the time should be shown in
 * the event's or boat's timezone rather than the device's.
 */
export const getTimePartsInTz = (date: Date, timeZoneID: string): {hours: number; minutes: number} => {
  const m = moment(date).tz(timeZoneID);
  return {hours: m.hours(), minutes: m.minutes()};
};

/**
 * Return the start of the calendar day (midnight) in the given timezone for the given instant.
 * Useful for form date pickers when the "day" should be in boat/event timezone.
 */
export const getStartOfDayInTz = (date: Date, timeZoneID: string): Date => {
  return moment(date).tz(timeZoneID).startOf('day').toDate();
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
    const intervalId = setInterval(
      () => {
        // Trigger a state refresh every 15 minutes
        setLastRefresh(new Date());
      },
      minutes * 60 * 1000,
    ); // 15 minutes in milliseconds

    // Clear the interval on component unmount
    return () => clearInterval(intervalId);
  }, [minutes]); // Empty dependency array ensures the effect runs only once on mount

  return lastRefresh;
};

/**
 * Returns a Date() that pretends like we're on the sailing. Basically takes
 * "today" and transposes it to the sailing week based on the cruise startDate.
 * This does not do anything with the current time.
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
 * @param timeZoneID When provided, startTime is interpreted in this timezone (e.g. tzAtTime(startDate)); otherwise device local.
 */
export const getScheduleItemStartEndTime = (
  startDate: Date | string,
  startTime: StartTime,
  duration: string | number,
  _?: string,
): StartEndTime => {
  const start = new Date(startDate);
  let eventStartTime: Date;

  // All of the callers of this function already handled the tzAtTime logic.
  // Doing it again here caused events to be correct in the form but get POSTed
  // with incorrect values. I am leaving this in here just in case we want to come
  // back it to some day.
  // if (timeZoneID) {
  //   const inTz = moment(start).tz(timeZoneID);
  //   const eventMoment = moment.tz(
  //     {
  //       year: inTz.year(),
  //       month: inTz.month(),
  //       date: inTz.date(),
  //       hour: startTime.hours,
  //       minute: startTime.minutes,
  //       second: 0,
  //       millisecond: 0,
  //     },
  //     timeZoneID,
  //   );
  //   eventStartTime = eventMoment.toDate();
  // } else {
  //   eventStartTime = new Date(start);
  //   eventStartTime.setHours(startTime.hours);
  //   eventStartTime.setMinutes(startTime.minutes);
  //   eventStartTime.setSeconds(0);
  //   eventStartTime.setMilliseconds(0);
  // }
  eventStartTime = new Date(start);
  eventStartTime.setHours(startTime.hours);
  eventStartTime.setMinutes(startTime.minutes);
  eventStartTime.setSeconds(0);
  eventStartTime.setMilliseconds(0);

  let eventEndTime = addMinutes(eventStartTime, Number(duration));
  return {startTime: eventStartTime, endTime: eventEndTime};
};

/**
 * Check if two time ranges overlap.
 * Two events overlap if the first event starts before the second ends AND the first event ends after the second starts.
 * @param start1 Start time of the first event (ISO string)
 * @param end1 End time of the first event (ISO string)
 * @param start2 Start time of the second event (ISO string)
 * @param end2 End time of the second event (ISO string)
 * @returns true if the events overlap in time, false otherwise
 */
export const eventsOverlap = (start1: string, end1: string, start2: string, end2: string): boolean => {
  return new Date(start1) < new Date(end2) && new Date(end1) > new Date(start2);
};
