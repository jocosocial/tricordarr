import {createContext, Dispatch, SetStateAction, useContext} from 'react';

export interface CruiseContextType {
  startDate: Date;
  endDate: Date;
  cruiseLength: number;
  cruiseDayIndex: number;
  daysSince: number;
  hourlyUpdatingDate: Date;
  cruiseDay: number;
  setCruiseDay: Dispatch<SetStateAction<number>>
}

export const CruiseContext = createContext({} as CruiseContextType);

export const useCruise = () => useContext(CruiseContext);
