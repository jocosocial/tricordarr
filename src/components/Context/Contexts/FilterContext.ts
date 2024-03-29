import {createContext, Dispatch, SetStateAction, useContext} from 'react';
import {FezType} from '../../../libraries/Enums/FezType';
import {ForumFilter, ForumSortOrder} from '../../../libraries/Enums/ForumSortFilter';

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
  forumSortOrder?: ForumSortOrder;
  setForumSortOrder: Dispatch<SetStateAction<ForumSortOrder | undefined>>;
  forumFilter?: ForumFilter;
  setForumFilter: Dispatch<SetStateAction<ForumFilter | undefined>>;
}

export const FilterContext = createContext(<ScheduleFilterContextType>{});

export const useFilter = () => useContext(FilterContext);
