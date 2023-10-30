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
  format,
} from 'date-fns';
import {useEffect, useState, useRef} from 'react';
import {CruiseDayData} from './Types';

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

export const calcCruiseDayTime = (dateValue: Date, cruiseStartDate: Date, cruiseEndDate: Date) => {
  let cruiseStartDay = cruiseStartDate.getDay();
  // Hackish. StartDate is midnight EST, which makes getDay return the day before in [PCM]ST.
  if (cruiseStartDate.getHours() > 12) {
    cruiseStartDay = (cruiseStartDay + 1) % 7;
  }
  // Subtract 3 hours so the 'day' divider for events is 3AM. NOT doing timezone math here.
  let adjustedDate = new Date(dateValue.getTime() - 3 * 60 * 60 * 1000);
  let cruiseDay = (7 - cruiseStartDay + adjustedDate.getDay()) % 7;
  if (adjustedDate >= cruiseStartDate && adjustedDate < cruiseEndDate) {
    cruiseDay = (adjustedDate.getTime() - cruiseStartDate.getTime()) / (1000 * 60 * 60 * 24);
  }
  let minutesSince3AM = adjustedDate.getHours() * 60 + adjustedDate.getMinutes();
  return [minutesSince3AM, cruiseDay];
};
