import {createContext, Dispatch, SetStateAction, useContext} from 'react';

import {ScheduleFilterSettings} from '#src/Types';

interface ScheduleFilterContextType {
  eventTypeFilter: string;
  setEventTypeFilter: Dispatch<SetStateAction<string>>;
  eventFavoriteFilter: boolean;
  setEventFavoriteFilter: Dispatch<SetStateAction<boolean>>;
  eventPersonalFilter: boolean;
  setEventPersonalFilter: Dispatch<SetStateAction<boolean>>;
  eventLfgJoinedFilter: boolean;
  setEventLfgJoinedFilter: Dispatch<SetStateAction<boolean>>;
  eventLfgOwnedFilter: boolean;
  setEventLfgOwnedFilter: Dispatch<SetStateAction<boolean>>;
  eventLfgOpenFilter: boolean;
  setEventLfgOpenFilter: Dispatch<SetStateAction<boolean>>;
  eventShutternautFilter: string | undefined;
  setEventShutternautFilter: Dispatch<SetStateAction<string | undefined>>;
  scheduleFilterSettings: ScheduleFilterSettings;
  eventPersonalUnreadFilter: boolean;
  setEventPersonalUnreadFilter: Dispatch<SetStateAction<boolean>>;
}

export const ScheduleFilterContext = createContext(<ScheduleFilterContextType>{});

export const useScheduleFilter = () => useContext(ScheduleFilterContext);
