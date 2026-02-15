import {createContext, useContext} from 'react';

import {CruiseDayData} from '#src/Types';

export interface CruiseContextType {
  startDate: Date;
  endDate: Date;
  cruiseLength: number;
  cruiseDayIndex: number;
  daysSince: number;
  cruiseDays: CruiseDayData[];
  cruiseDayToday: number;
  adjustedCruiseDayToday: number;
  adjustedCruiseDayIndex: number;
}

export const CruiseContext = createContext({} as CruiseContextType);

export const useCruise = () => useContext(CruiseContext);
