import React, {PropsWithChildren, useCallback, useEffect, useMemo, useState} from 'react';

import {useConfig} from '#src/Context/Contexts/ConfigContext';
import {useRoles} from '#src/Context/Contexts/RoleContext';
import {ScheduleFilterContext} from '#src/Context/Contexts/ScheduleFilterContext';
import {EventType} from '#src/Enums/EventType';
import {ScheduleSourceKey} from '#src/Enums/ScheduleSource';
import {ShutternautFilterKey} from '#src/Enums/ShutternautFilter';
import {ScheduleFilterSettings} from '#src/Types';

/**
 * Provides the schedule filter state (see #458): sources (which lists contribute items —
 * additive/OR) and refinements (event type, favorite, shutternaut status, unread — narrow a
 * source, AND). Selecting a refinement implies its source; deselecting a source clears its
 * refinements. See resolveScheduleSources() in src/Libraries/Schedule.ts for how eventSources
 * resolves to a concrete set.
 */
export const ScheduleFilterProvider = ({children}: PropsWithChildren) => {
  const {appConfig} = useConfig();
  const {hasShutternaut, hasShutternautManager} = useRoles();
  const [eventSources, setEventSources] = useState<ScheduleSourceKey[]>([]);
  const [eventTypeFilter, setEventTypeFilter] = useState('');
  const [eventFavoriteFilter, setEventFavoriteFilter] = useState(false);
  const [eventShutternautFilter, setEventShutternautFilter] = useState<ShutternautFilterKey | undefined>(undefined);
  const [eventPersonalUnreadFilter, setEventPersonalUnreadFilter] = useState(false);

  // Shutternaut filters only make sense for users holding one of the roles. If the role is
  // lost (or was never held) while a filter is still set, clear it rather than leaving a
  // filter active that the menu no longer exposes a way to change.
  useEffect(() => {
    if (!hasShutternaut && !hasShutternautManager && eventShutternautFilter !== undefined) {
      setEventShutternautFilter(undefined);
    }
  }, [hasShutternaut, hasShutternautManager, eventShutternautFilter]);

  // The Open LFGs source is disabled in the menu while its config setting is off. Drop it from
  // the selection if the setting is turned off while it's selected, so it can't stay active
  // with no way to deselect it.
  useEffect(() => {
    if (!appConfig.schedule.eventsShowOpenLfgs) {
      setEventSources(prev => (prev.includes('lfgOpen') ? prev.filter(s => s !== 'lfgOpen') : prev));
    }
  }, [appConfig.schedule.eventsShowOpenLfgs]);

  // Turning a refinement on implies its source, so a refinement is never silently inert and
  // the matching source checkmark lights up to explain why the list narrowed. See #458.
  const addSource = useCallback((source: ScheduleSourceKey) => {
    setEventSources(prev => (prev.includes(source) ? prev : [...prev, source]));
  }, []);

  const setEventTypeFilterWithSource = useCallback(
    (value: React.SetStateAction<string>) => {
      setEventTypeFilter(prev => {
        const next = typeof value === 'function' ? value(prev) : value;
        if (next) {
          addSource('officialEvents');
        }
        return next;
      });
    },
    [addSource],
  );

  const setEventFavoriteFilterWithSource = useCallback(
    (value: React.SetStateAction<boolean>) => {
      setEventFavoriteFilter(prev => {
        const next = typeof value === 'function' ? value(prev) : value;
        if (next) {
          addSource('officialEvents');
        }
        return next;
      });
    },
    [addSource],
  );

  const setEventShutternautFilterWithSource = useCallback(
    (value: React.SetStateAction<ShutternautFilterKey | undefined>) => {
      setEventShutternautFilter(prev => {
        const next = typeof value === 'function' ? value(prev) : value;
        if (next !== undefined) {
          addSource('officialEvents');
        }
        return next;
      });
    },
    [addSource],
  );

  const setEventPersonalUnreadFilterWithSource = useCallback(
    (value: React.SetStateAction<boolean>) => {
      setEventPersonalUnreadFilter(prev => {
        const next = typeof value === 'function' ? value(prev) : value;
        if (next) {
          addSource('privateEvents');
        }
        return next;
      });
    },
    [addSource],
  );

  // Turning a source off clears whatever was narrowing it (rule 3), so re-enabling it later
  // starts from an unfiltered view of that source rather than a stale, hidden refinement.
  const toggleEventSource = useCallback(
    (source: ScheduleSourceKey) => {
      setEventSources(prev => {
        if (prev.includes(source)) {
          if (source === 'officialEvents') {
            setEventTypeFilter('');
            setEventFavoriteFilter(false);
            setEventShutternautFilter(undefined);
          }
          if (source === 'privateEvents') {
            setEventPersonalUnreadFilter(false);
          }
          return prev.filter(s => s !== source);
        }
        return [...prev, source];
      });
    },
    [setEventSources],
  );

  const clearScheduleFilters = useCallback(() => {
    setEventSources([]);
    setEventTypeFilter('');
    setEventFavoriteFilter(false);
    setEventShutternautFilter(undefined);
    setEventPersonalUnreadFilter(false);
  }, []);

  const scheduleFilterSettings: ScheduleFilterSettings = useMemo(
    () => ({
      eventSources,
      eventTypeFilter: eventTypeFilter ? (eventTypeFilter as keyof typeof EventType) : undefined,
      eventFavoriteFilter,
      eventShutternautFilter,
      eventPersonalUnreadFilter,
      showJoinedLfgs: appConfig.schedule.eventsShowJoinedLfgs,
      showOpenLfgs: appConfig.schedule.eventsShowOpenLfgs,
    }),
    [
      eventSources,
      eventTypeFilter,
      eventFavoriteFilter,
      eventShutternautFilter,
      eventPersonalUnreadFilter,
      appConfig.schedule.eventsShowJoinedLfgs,
      appConfig.schedule.eventsShowOpenLfgs,
    ],
  );

  const anyScheduleFilterActive = !!(
    eventSources.length ||
    eventTypeFilter ||
    eventFavoriteFilter ||
    eventShutternautFilter !== undefined ||
    eventPersonalUnreadFilter
  );

  return (
    <ScheduleFilterContext.Provider
      value={{
        eventSources,
        setEventSources,
        toggleEventSource,
        eventTypeFilter,
        setEventTypeFilter: setEventTypeFilterWithSource,
        eventFavoriteFilter,
        setEventFavoriteFilter: setEventFavoriteFilterWithSource,
        eventShutternautFilter,
        setEventShutternautFilter: setEventShutternautFilterWithSource,
        eventPersonalUnreadFilter,
        setEventPersonalUnreadFilter: setEventPersonalUnreadFilterWithSource,
        scheduleFilterSettings,
        anyScheduleFilterActive,
        clearScheduleFilters,
      }}>
      {children}
    </ScheduleFilterContext.Provider>
  );
};
