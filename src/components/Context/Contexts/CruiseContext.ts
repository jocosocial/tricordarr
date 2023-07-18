import {createContext, useContext} from 'react';

export interface CruiseContextType {
  startDate: Date;
  endDate: Date;
  cruiseLength: number;
  cruiseDayIndex: number;
  daysSince: number;
  hourlyUpdatingDate: Date;
}

export const CruiseContext = createContext({} as CruiseContextType);

export const useCruise = () => useContext(CruiseContext);
