import {createContext, useContext} from 'react';
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
  adjustedCruiseDayToday: number;
  adjustedCruiseDayIndex: number;
  showTimeZoneWarning: boolean;
}

export const CruiseContext = createContext({} as CruiseContextType);

export const useCruise = () => useContext(CruiseContext);
