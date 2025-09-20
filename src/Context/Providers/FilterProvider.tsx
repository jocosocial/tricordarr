import React, {PropsWithChildren, useState} from 'react';
import {FilterContext} from '#src/Context/Contexts/FilterContext.ts';
import {FezType} from '../../../Libraries/Enums/FezType.ts';
import {useConfig} from '#src/Context/Contexts/ConfigContext.ts';
import {ForumFilter, ForumSortDirection, ForumSort} from '../../../Libraries/Enums/ForumSortFilter.ts';
import {ScheduleFilterSettings} from '../../../Libraries/Types/index.ts';
import {EventType} from '../../../Libraries/Enums/EventType.ts';

export const FilterProvider = ({children}: PropsWithChildren) => {
  const {appConfig} = useConfig();
  const [eventTypeFilter, setEventTypeFilter] = useState('');
  const [eventFavoriteFilter, setEventFavoriteFilter] = useState(false);
  const [lfgCruiseDayFilter, setLfgCruiseDayFilter] = useState<number>();
  const [lfgTypeFilter, setLfgTypeFilter] = useState<keyof typeof FezType>();
  const [lfgHidePastFilter, setLfgHidePastFilter] = useState(appConfig.schedule.hidePastLfgs);
  const [forumFilter, setForumFilter] = useState<ForumFilter>();
  const [forumSortOrder, setForumSortOrder] = useState<ForumSort | undefined>(
    appConfig.userPreferences.defaultForumSortOrder,
  );
  const [eventPersonalFilter, setEventPersonalFilter] = useState(false);
  const [eventLfgFilter, setEventLfgFilter] = useState(false);
  const [forumSortDirection, setForumSortDirection] = useState<ForumSortDirection | undefined>(
    appConfig.userPreferences.defaultForumSortDirection,
  );

  const scheduleFilterSettings: ScheduleFilterSettings = {
    eventTypeFilter: eventTypeFilter ? (eventTypeFilter as keyof typeof EventType) : undefined,
    eventFavoriteFilter: eventFavoriteFilter,
    showJoinedLfgs: appConfig.schedule.eventsShowJoinedLfgs,
    showOpenLfgs: appConfig.schedule.eventsShowOpenLfgs,
    eventPersonalFilter: eventPersonalFilter,
    eventLfgFilter: eventLfgFilter,
  };

  return (
    <FilterContext.Provider
      value={{
        eventTypeFilter,
        setEventTypeFilter,
        eventFavoriteFilter,
        setEventFavoriteFilter,
        lfgCruiseDayFilter,
        setLfgCruiseDayFilter,
        lfgTypeFilter,
        setLfgTypeFilter,
        lfgHidePastFilter,
        setLfgHidePastFilter,
        forumFilter,
        setForumFilter,
        forumSortOrder,
        setForumSortOrder,
        eventPersonalFilter,
        setEventPersonalFilter,
        eventLfgFilter,
        setEventLfgFilter,
        scheduleFilterSettings,
        forumSortDirection,
        setForumSortDirection,
      }}>
      {children}
    </FilterContext.Provider>
  );
};
