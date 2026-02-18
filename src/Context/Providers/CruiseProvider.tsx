import {differenceInCalendarDays} from 'date-fns';
import React, {PropsWithChildren} from 'react';

import {useConfig} from '#src/Context/Contexts/ConfigContext';
import {CruiseContext} from '#src/Context/Contexts/CruiseContext';
import {useTime} from '#src/Context/Contexts/TimeContext';
import {getCruiseDay, getCruiseDays} from '#src/Libraries/DateTime';

export const CruiseProvider = ({children}: PropsWithChildren) => {
  const {appConfig} = useConfig();
  const {hourlyUpdatingDate} = useTime();
  // We use 3AM as the day rollover point because many people stay up late. This is done in Swiftarr and elsewhere here.
  let lateNightOffset = 0;
  if (appConfig.schedule.enableLateDayFlip) {
    lateNightOffset = 3 * 60 * 60 * 1000;
  }
  let adjustedDate = new Date(hourlyUpdatingDate.getTime() - lateNightOffset);
  // Day of the cruise. Starts at 1 and goes up to the appConfig.cruiseLength (usually 8 for a week-long Sat->Sat cruise).
  const cruiseDayToday = getCruiseDay(hourlyUpdatingDate, appConfig.cruiseStartDate.getDay());
  const adjustedCruiseDayToday = getCruiseDay(adjustedDate, appConfig.cruiseStartDate.getDay());
  // Start date of the cruise.
  const startDate = appConfig.cruiseStartDate;
  // Number of days in the cruise (including Embarkation/Debarkation days).
  const cruiseLength = appConfig.cruiseLength;
  // End Date. New object to prevent copying/reference.
  let endDate = new Date(startDate.getTime());
  endDate.setDate(startDate.getDate() + cruiseLength - 1);
  // Day Index. Similar to the Swiftarr Site UI this is used to show "days before/days after" the sailing.
  // Both use differenceInCalendarDays (calendar-date-based, ignoring time) rather than differenceInDays
  // (full 24-hour periods). Since adjustedDate already has the lateDayFlip 3-hour offset applied,
  // differenceInCalendarDays correctly flips the day at 3 AM: at 2:59 AM the adjusted date is still the
  // previous calendar day (11:59 PM), at 3:00 AM it becomes midnight of the new day.
  // See https://github.com/jocosocial/tricordarr/issues/282
  const cruiseDayIndex = differenceInCalendarDays(hourlyUpdatingDate, startDate);
  const adjustedCruiseDayIndex = differenceInCalendarDays(adjustedDate, startDate);
  // Days Since.
  const daysSince = cruiseDayIndex - cruiseLength;
  // Array of cruise day names and configs.
  const cruiseDays = getCruiseDays(startDate, cruiseLength);

  return (
    <CruiseContext.Provider
      value={{
        startDate,
        endDate,
        cruiseLength,
        cruiseDayIndex,
        daysSince,
        cruiseDays,
        cruiseDayToday,
        adjustedCruiseDayIndex,
        adjustedCruiseDayToday,
      }}>
      {children}
    </CruiseContext.Provider>
  );
};
