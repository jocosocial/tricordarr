import React, {PropsWithChildren, useState} from 'react';
import {CruiseContext} from '../Contexts/CruiseContext';
import {useConfig} from '../Contexts/ConfigContext';
import useDateTime, {getCruiseDay} from '../../../libraries/DateTime';
import {differenceInCalendarDays} from 'date-fns';

export const CruiseProvider = ({children}: PropsWithChildren) => {
  const {appConfig} = useConfig();
  const [cruiseDay, setCruiseDay] = useState(getCruiseDay(appConfig.cruiseStartDate.getDay()))
  const startDate = appConfig.cruiseStartDate;
  const cruiseLength = appConfig.cruiseLength;
  const hourlyUpdatingDate = useDateTime('hour');
  // End Date. New object to prevent copying/reference.
  let endDate = new Date(startDate.getTime());
  endDate.setDate(startDate.getDate() + cruiseLength);
  // Day Index
  const cruiseDayIndex = differenceInCalendarDays(hourlyUpdatingDate, startDate);
  // Days Since
  const daysSince = cruiseDayIndex - cruiseLength;

  console.log('Start Date', startDate.toISOString());
  console.log('Current Date', hourlyUpdatingDate.toISOString());
  console.log('Cruise Day Index', cruiseDayIndex);

  return (
    <CruiseContext.Provider value={{startDate, endDate, cruiseLength, cruiseDayIndex, daysSince, hourlyUpdatingDate, cruiseDay, setCruiseDay}}>
      {children}
    </CruiseContext.Provider>
  );
};
