import {createContext, Dispatch, SetStateAction, useContext} from 'react';

import {ScheduleSourceKey} from '#src/Enums/ScheduleSource';
import {ShutternautFilterKey} from '#src/Enums/ShutternautFilter';
import {ScheduleFilterSettings} from '#src/Types';

interface ScheduleFilterContextType {
  eventSources: ScheduleSourceKey[];
  setEventSources: Dispatch<SetStateAction<ScheduleSourceKey[]>>;
  /** Adds the source if it isn't selected, removes it (and its refinements) if it is. */
  toggleEventSource: (source: ScheduleSourceKey) => void;
  eventTypeFilter: string;
  setEventTypeFilter: Dispatch<SetStateAction<string>>;
  eventFavoriteFilter: boolean;
  setEventFavoriteFilter: Dispatch<SetStateAction<boolean>>;
  eventShutternautFilter: ShutternautFilterKey | undefined;
  setEventShutternautFilter: Dispatch<SetStateAction<ShutternautFilterKey | undefined>>;
  eventPersonalUnreadFilter: boolean;
  setEventPersonalUnreadFilter: Dispatch<SetStateAction<boolean>>;
  scheduleFilterSettings: ScheduleFilterSettings;
  /** True if any source or refinement has been explicitly selected. */
  anyScheduleFilterActive: boolean;
  /** Resets every filter to its default (no explicit sources, no refinements). */
  clearScheduleFilters: () => void;
}

export const ScheduleFilterContext = createContext(<ScheduleFilterContextType>{});

export const useScheduleFilter = () => useContext(ScheduleFilterContext);
