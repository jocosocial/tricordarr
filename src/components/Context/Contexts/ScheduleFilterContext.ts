import {createContext, Dispatch, SetStateAction, useContext} from 'react';

interface ScheduleFilterContextType {
  eventTypeFilter: string;
  setEventTypeFilter: Dispatch<SetStateAction<string>>;
  eventFavoriteFilter: boolean;
  setEventFavoriteFilter: Dispatch<SetStateAction<boolean>>;
}

export const ScheduleFilterContext = createContext(<ScheduleFilterContextType>{});

export const useScheduleFilter = () => useContext(ScheduleFilterContext);
