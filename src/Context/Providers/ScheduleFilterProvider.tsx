import React, {PropsWithChildren, useEffect, useState} from 'react';

import {useConfig} from '#src/Context/Contexts/ConfigContext';
import {ScheduleFilterContext} from '#src/Context/Contexts/ScheduleFilterContext';
import {EventType} from '#src/Enums/EventType';
import {ScheduleFilterSettings} from '#src/Types';

export const ScheduleFilterProvider = ({children}: PropsWithChildren) => {
  const {appConfig} = useConfig();
  const [eventTypeFilter, setEventTypeFilter] = useState('');
  const [eventFavoriteFilter, setEventFavoriteFilter] = useState(false);
  const [eventPersonalFilter, setEventPersonalFilter] = useState(false);
  const [eventPersonalUnreadFilter, setEventPersonalUnreadFilter] = useState(false);
  const [eventLfgJoinedFilter, setEventLfgJoinedFilter] = useState(false);
  const [eventLfgOwnedFilter, setEventLfgOwnedFilter] = useState(false);
  const [eventLfgOpenFilter, setEventLfgOpenFilter] = useState(false);
  const [eventShutternautFilter, setEventShutternautFilter] = useState<string | undefined>(undefined);

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
    eventShutternautFilter: eventShutternautFilter,
    eventPersonalUnreadFilter: eventPersonalUnreadFilter,
  };

  return (
    <ScheduleFilterContext.Provider
      value={{
        eventTypeFilter,
        setEventTypeFilter,
        eventFavoriteFilter,
        setEventFavoriteFilter,
        eventPersonalFilter,
        setEventPersonalFilter,
        eventLfgJoinedFilter,
        setEventLfgJoinedFilter,
        eventLfgOwnedFilter,
        setEventLfgOwnedFilter,
        eventLfgOpenFilter,
        setEventLfgOpenFilter,
        eventShutternautFilter,
        setEventShutternautFilter,
        scheduleFilterSettings,
        eventPersonalUnreadFilter,
        setEventPersonalUnreadFilter,
      }}>
      {children}
    </ScheduleFilterContext.Provider>
  );
};
