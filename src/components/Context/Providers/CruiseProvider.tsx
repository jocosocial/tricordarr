import React, {useState, PropsWithChildren, ReactNode} from 'react';
import {ModalContext} from '../Contexts/ModalContext';
import {CruiseContext} from '../Contexts/CruiseContext';
import {useConfig} from '../Contexts/ConfigContext';

export const CruiseProvider = ({children}: PropsWithChildren) => {
  const {appConfig} = useConfig();
  // const startDate = appConfig.cruiseStartDate;
  const startDate = new Date(2023, 2, 5);
  const cruiseLength = appConfig.cruiseLength;
  // End Date
  let endDate = new Date(startDate.getTime());
  endDate.setDate(startDate.getDate() + cruiseLength);
  // Day Index
  const timeDiff = startDate.getTime() - new Date().getTime();
  const cruiseDayIndex = Math.abs(Math.floor(timeDiff / (1000 * 3600 * 24))) - 1;
  // Days Since
  const daysSince = cruiseDayIndex - cruiseLength;

  return (
    <CruiseContext.Provider value={{startDate, endDate, cruiseLength, cruiseDayIndex, daysSince}}>
      {children}
    </CruiseContext.Provider>
  );
};
