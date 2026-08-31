import {createContext, Dispatch, SetStateAction, useContext} from 'react';

interface ScheduleCruiseDayContextType {
  /**
   * Currently selected cruise day (1-indexed, or 0 for All Days).
   * Shared between Schedule Day and Day Planner so Back keeps the same day.
   */
  selectedCruiseDay: number;
  setSelectedCruiseDay: Dispatch<SetStateAction<number>>;
}

export const ScheduleCruiseDayContext = createContext(<ScheduleCruiseDayContextType>{});

export const useScheduleCruiseDay = () => useContext(ScheduleCruiseDayContext);
