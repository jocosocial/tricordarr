import {createContext, Dispatch, SetStateAction, useContext} from 'react';

interface ScheduleFilterContextType {
  eventTypeFilter: string;
  setEventTypeFilter: Dispatch<SetStateAction<string>>;
}

export const ScheduleFilterContext = createContext(<ScheduleFilterContextType>{});

export const useScheduleFilter = () => useContext(ScheduleFilterContext);
