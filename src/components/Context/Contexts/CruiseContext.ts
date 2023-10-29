import {createContext, Dispatch, SetStateAction, useContext} from 'react';
import {CruiseDayData} from '../../../libraries/Types';

export interface CruiseContextType {
  startDate: Date;
  endDate: Date;
  cruiseLength: number;
  cruiseDayIndex: number;
  daysSince: number;
  hourlyUpdatingDate: Date;
  cruiseDays: CruiseDayData[];
  cruiseDayToday: number;
}

export const CruiseContext = createContext({} as CruiseContextType);

export const useCruise = () => useContext(CruiseContext);
