import React, {PropsWithChildren} from 'react';
import {CruiseContext} from '../Contexts/CruiseContext';
import {useConfig} from '../Contexts/ConfigContext';
import useDateTime from '../../../libraries/DateTime';

export const CruiseProvider = ({children}: PropsWithChildren) => {
  const {appConfig} = useConfig();
  const startDate = appConfig.cruiseStartDate;
  const cruiseLength = appConfig.cruiseLength;
  const hourlyUpdatingDate = useDateTime('hour');
  // End Date. New object to prevent copying/reference.
  let endDate = new Date(startDate.getTime());
  endDate.setDate(startDate.getDate() + cruiseLength);
  // Day Index
  const timeDiff = hourlyUpdatingDate.getTime() - startDate.getTime();
  const cruiseDayIndex = Math.floor(timeDiff / (1000 * 3600 * 24));
  // Days Since
  const daysSince = cruiseDayIndex - cruiseLength;

  console.log('Start Date', startDate.toISOString());
  console.log('Current Date', hourlyUpdatingDate.toISOString());
  console.log('Cruise Day Index', cruiseDayIndex);

  return (
    <CruiseContext.Provider value={{startDate, endDate, cruiseLength, cruiseDayIndex, daysSince, hourlyUpdatingDate}}>
      {children}
    </CruiseContext.Provider>
  );
};
