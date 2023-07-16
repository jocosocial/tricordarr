import React, {PropsWithChildren} from 'react';
import {CruiseContext} from '../Contexts/CruiseContext';
import {useConfig} from '../Contexts/ConfigContext';

export const CruiseProvider = ({children}: PropsWithChildren) => {
  const {appConfig} = useConfig();
  const startDate = appConfig.cruiseStartDate;
  const cruiseLength = appConfig.cruiseLength;
  // End Date
  let endDate = new Date(startDate.getTime());
  endDate.setDate(startDate.getDate() + cruiseLength);
  // Day Index
  const timeDiff = new Date().getTime() - startDate.getTime();
  const cruiseDayIndex = Math.floor(timeDiff / (1000 * 3600 * 24));
  // Days Since
  const daysSince = cruiseDayIndex - cruiseLength;

  return (
    <CruiseContext.Provider value={{startDate, endDate, cruiseLength, cruiseDayIndex, daysSince}}>
      {children}
    </CruiseContext.Provider>
  );
};
