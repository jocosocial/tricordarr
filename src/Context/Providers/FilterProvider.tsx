import React, {PropsWithChildren, useEffect, useState} from 'react';

import {useConfig} from '#src/Context/Contexts/ConfigContext';
import {FilterContext} from '#src/Context/Contexts/FilterContext';
import {EventType} from '#src/Enums/EventType';
import {FezType} from '#src/Enums/FezType';
import {ForumFilter, ForumSort, ForumSortDirection} from '#src/Enums/ForumSortFilter';
import {ScheduleFilterSettings} from '#src/Types';

export const FilterProvider = ({children}: PropsWithChildren) => {
  const {appConfig} = useConfig();
  const [eventTypeFilter, setEventTypeFilter] = useState('');
  const [eventFavoriteFilter, setEventFavoriteFilter] = useState(false);
  const [lfgCruiseDayFilter, setLfgCruiseDayFilter] = useState<number>();
  const [lfgTypeFilter, setLfgTypeFilter] = useState<keyof typeof FezType>();
  const [lfgHidePastFilter, setLfgHidePastFilter] = useState(appConfig.schedule.hidePastLfgs);
  const [lfgOnlyNew, setLfgOnlyNew] = useState<boolean | undefined>(undefined);
  const [forumFilter, setForumFilter] = useState<ForumFilter>();
  const [forumSortOrder, setForumSortOrder] = useState<ForumSort | undefined>(
    appConfig.userPreferences.defaultForumSortOrder,
  );
  const [eventPersonalFilter, setEventPersonalFilter] = useState(false);
  const [eventLfgJoinedFilter, setEventLfgJoinedFilter] = useState(false);
  const [eventLfgOwnedFilter, setEventLfgOwnedFilter] = useState(false);
  const [eventLfgOpenFilter, setEventLfgOpenFilter] = useState(false);
  const [forumSortDirection, setForumSortDirection] = useState<ForumSortDirection | undefined>(
    appConfig.userPreferences.defaultForumSortDirection,
  );

  // Clear the Open LFGs filter if the setting is disabled
  useEffect(() => {
    if (!appConfig.schedule.eventsShowOpenLfgs && eventLfgOpenFilter) {
      setEventLfgOpenFilter(false);
    }
  }, [appConfig.schedule.eventsShowOpenLfgs, eventLfgOpenFilter]);

  const scheduleFilterSettings: ScheduleFilterSettings = {
    eventTypeFilter: eventTypeFilter ? (eventTypeFilter as keyof typeof EventType) : undefined,
    eventFavoriteFilter: eventFavoriteFilter,
    showJoinedLfgs: appConfig.schedule.eventsShowJoinedLfgs,
    showOpenLfgs: appConfig.schedule.eventsShowOpenLfgs,
    eventPersonalFilter: eventPersonalFilter,
    eventLfgJoinedFilter: eventLfgJoinedFilter,
    eventLfgOwnedFilter: eventLfgOwnedFilter,
    eventLfgOpenFilter: eventLfgOpenFilter,
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
        lfgOnlyNew,
        setLfgOnlyNew,
        forumFilter,
        setForumFilter,
        forumSortOrder,
        setForumSortOrder,
        eventPersonalFilter,
        setEventPersonalFilter,
        eventLfgJoinedFilter,
        setEventLfgJoinedFilter,
        eventLfgOwnedFilter,
        setEventLfgOwnedFilter,
        eventLfgOpenFilter,
        setEventLfgOpenFilter,
        scheduleFilterSettings,
        forumSortDirection,
        setForumSortDirection,
      }}>
      {children}
    </FilterContext.Provider>
  );
};
