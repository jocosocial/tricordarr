import React, {PropsWithChildren} from 'react';
import {CruiseContext} from '../Contexts/CruiseContext';
import {useConfig} from '../Contexts/ConfigContext';
import useDateTime, {getCruiseDay, getCruiseDays} from '../../../libraries/DateTime';
import {differenceInCalendarDays, differenceInDays} from 'date-fns';
import {useUserNotificationDataQuery} from '../../Queries/Alert/NotificationQueries.ts';

export const CruiseProvider = ({children}: PropsWithChildren) => {
  const {appConfig} = useConfig();
  // The hourlyUpdatingDate is a Date that will trigger a state refresh every hour on the hour.
  const hourlyUpdatingDate = useDateTime('hour');
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
  // There is a difference in behavior between differenceInDays and differenceInCalendarDays. IMO the latter
  // is more accurate but that's not what we do in the Site UI / Swift lang. So we have to be a little weird.
  const cruiseDayIndex = differenceInCalendarDays(hourlyUpdatingDate, startDate);
  const adjustedCruiseDayIndex = differenceInDays(adjustedDate, startDate);
  // Days Since.
  const daysSince = cruiseDayIndex - cruiseLength;
  // Array of cruise day names and configs.
  const cruiseDays = getCruiseDays(startDate, cruiseLength);

  // Figure out of the device is in the wrong time zone.
  const {data: userNotificationData} = useUserNotificationDataQuery();
  // .getTimezoneOffset() reports in minutes and from the opposite perspective
  // as the server. Server says "you're -4" whereas device says "they're +4".
  const deviceTimeOffset = new Date().getTimezoneOffset() * -60;
  const showTimeZoneWarning = !!userNotificationData && deviceTimeOffset !== userNotificationData.serverTimeOffset;

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
        adjustedCruiseDayIndex,
        adjustedCruiseDayToday,
        showTimeZoneWarning,
      }}>
      {children}
    </CruiseContext.Provider>
  );
};
