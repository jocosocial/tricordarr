import {createContext, Dispatch, SetStateAction, useContext} from 'react';
import {FezType} from '../../../libraries/Enums/FezType';

interface ScheduleFilterContextType {
  eventTypeFilter: string;
  setEventTypeFilter: Dispatch<SetStateAction<string>>;
  eventFavoriteFilter: boolean;
  setEventFavoriteFilter: Dispatch<SetStateAction<boolean>>;
  lfgCruiseDayFilter?: number;
  setLfgCruiseDayFilter: Dispatch<SetStateAction<number | undefined>>;
  lfgTypeFilter?: keyof typeof FezType;
  setLfgTypeFilter: Dispatch<SetStateAction<keyof typeof FezType | undefined>>;
  lfgHidePastFilter: boolean;
  setLfgHidePastFilter: Dispatch<SetStateAction<boolean>>;
}

export const ScheduleFilterContext = createContext(<ScheduleFilterContextType>{});

export const useScheduleFilter = () => useContext(ScheduleFilterContext);
