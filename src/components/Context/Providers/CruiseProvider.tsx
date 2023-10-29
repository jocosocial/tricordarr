import React, {PropsWithChildren, useState} from 'react';
import {CruiseContext} from '../Contexts/CruiseContext';
import {useConfig} from '../Contexts/ConfigContext';
import useDateTime, {getCruiseDay, getCruiseDays} from '../../../libraries/DateTime';
import {differenceInCalendarDays} from 'date-fns';

export const CruiseProvider = ({children}: PropsWithChildren) => {
  const {appConfig} = useConfig();
  // The hourlyUpdatingDate is a Date that will trigger a state refresh every hour on the hour.
  const hourlyUpdatingDate = useDateTime('hour');
  // Day of the cruise. Starts at 1 and goes up to the appConfig.cruiseLength (usually 8 for a week-long Sat->Sat cruise).
  const cruiseDayToday = getCruiseDay(hourlyUpdatingDate, appConfig.cruiseStartDate.getDay());
  // Start date of the cruise.
  const startDate = appConfig.cruiseStartDate;
  // Number of days in the cruise (including Embarkation/Debarkation days).
  const cruiseLength = appConfig.cruiseLength;
  // End Date. New object to prevent copying/reference.
  let endDate = new Date(startDate.getTime());
  endDate.setDate(startDate.getDate() + cruiseLength);
  // Day Index. Similar to the Swiftarr Site UI this is used to show "days before/days after" the sailing.
  const cruiseDayIndex = differenceInCalendarDays(hourlyUpdatingDate, startDate);
  // Days Since. @TODO has this been tested with pre-cruise?
  const daysSince = cruiseDayIndex - cruiseLength;
  // Array of cruise day names and configs.
  const cruiseDays = getCruiseDays(startDate, cruiseLength);

  console.log('Start Date', startDate.toISOString());
  console.log('Current Date', hourlyUpdatingDate.toISOString());
  console.log('Cruise Day Index', cruiseDayIndex);

  return (
    <CruiseContext.Provider
      value={{
        startDate,
        endDate,
        cruiseLength,
        cruiseDayIndex,
        daysSince,
        hourlyUpdatingDate,
        cruiseDays,
        cruiseDayToday,
      }}>
      {children}
    </CruiseContext.Provider>
  );
};
