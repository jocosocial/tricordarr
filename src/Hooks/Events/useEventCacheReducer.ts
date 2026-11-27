import {useQueryClient} from '@tanstack/react-query';
import {useCallback} from 'react';

import {useCruise} from '#src/Context/Contexts/CruiseContext';
import {useSession} from '#src/Context/Contexts/SessionContext';
import {useSwiftarrQueryClient} from '#src/Context/Contexts/SwiftarrQueryClientContext';
import {useTimeZone} from '#src/Hooks/useTimeZone';
import {calcCruiseDayTime} from '#src/Libraries/DateTime';
import {photographerListMembership, withUserPhotographing} from '#src/Libraries/Events/PhotographerCacheReduction';
import {EventData, PerformerData, PerformerHeaderData, UserHeader} from '#src/Structs/ControllerStructs';

/**
 * Insert an event into a sorted (by startTime ascending) array. Returns the
 * same array reference if the event is already present.
 */
function insertSortedByStartTime(events: EventData[] | undefined, event: EventData): EventData[] {
  if (!events) {
    return [event];
  }
  if (events.some(e => e.eventID === event.eventID)) {
    return events;
  }
  const index = events.findIndex(e => (e.startTime ?? '') > (event.startTime ?? ''));
  const insertAt = index === -1 ? events.length : index;
  return [...events.slice(0, insertAt), event, ...events.slice(insertAt)];
}

/** Remove an event (by eventID) from an array. Returns the same array reference if not found. */
function removeByEventID(events: EventData[] | undefined, eventID: string): EventData[] | undefined {
  if (!events) {
    return events;
  }
  const next = events.filter(e => e.eventID !== eventID);
  return next.length === events.length ? events : next;
}

/**
 * Hook that exposes discrete actions for optimistically updating React Query
 * caches after event mutations (favorite, photographer status) and for
 * prepopulating the event detail cache from data already in hand. Each
 * action calls setQueryData / setQueriesData and always returns new objects
 * so React Query detects the change and triggers re-renders.
 *
 * No local state, no useReducer -- just named functions that transform the cache.
 */
export const useEventCacheReducer = () => {
  const queryClient = useQueryClient();
  const {queryKeyExtraData} = useSwiftarrQueryClient();
  const {startDate, endDate} = useCruise();
  const {tzAtTime} = useTimeZone();
  const {currentUserID} = useSession();

  const eventDetailQueryKey = useCallback(
    (eventID: string) => [`/events/${eventID}`, undefined, ...queryKeyExtraData],
    [queryKeyExtraData],
  );

  /**
   * Cruise day (1-indexed, matching the `cruiseday` param accepted by /events)
   * that an event's startTime falls on, or undefined if it can't be computed.
   */
  const computeCruiseDay = useCallback(
    (startTime: string | undefined): number | undefined => {
      if (!startTime) return undefined;
      try {
        return calcCruiseDayTime(new Date(startTime), startDate, endDate, tzAtTime).cruiseDay;
      } catch {
        return undefined;
      }
    },
    [startDate, endDate, tzAtTime],
  );

  /**
   * Apply `updater` to the matching EventData (by eventID) across every
   * `/events` list cache, the `/events/{eventID}` detail cache, and every
   * `/performer/*` detail cache's embedded `events` array.
   */
  const updateEventInAllCaches = useCallback(
    (eventID: string, updater: (event: EventData) => EventData) => {
      const listUpdater = (event: EventData) => (event.eventID === eventID ? updater(event) : event);

      queryClient.setQueriesData<EventData[]>({queryKey: ['/events']}, oldData =>
        oldData ? oldData.map(listUpdater) : oldData,
      );

      queryClient.setQueryData<EventData>(eventDetailQueryKey(eventID), oldData =>
        oldData ? updater(oldData) : oldData,
      );

      for (const query of queryClient.getQueryCache().findAll({
        predicate: q => typeof q.queryKey[0] === 'string' && (q.queryKey[0] as string).startsWith('/performer/'),
      })) {
        queryClient.setQueryData<PerformerData>(query.queryKey, oldData => {
          if (!oldData?.events) {
            return oldData;
          }
          return {...oldData, events: oldData.events.map(listUpdater)};
        });
      }
    },
    [queryClient, eventDetailQueryKey],
  );

  /**
   * Remove an event (by eventID) from every `/events` list cache, every
   * `/performer/*` detail cache's embedded `events` array, and evict its
   * `/events/{eventID}` detail cache entirely. Unlike an in-place update,
   * removal doesn't depend on knowing a query's filter params, so it's safe
   * to apply universally.
   */
  const removeEventInAllCaches = useCallback(
    (eventID: string) => {
      queryClient.setQueriesData<EventData[]>({queryKey: ['/events']}, oldData =>
        oldData ? removeByEventID(oldData, eventID) : oldData,
      );

      queryClient.removeQueries({queryKey: eventDetailQueryKey(eventID)});

      for (const query of queryClient.getQueryCache().findAll({
        predicate: q => typeof q.queryKey[0] === 'string' && (q.queryKey[0] as string).startsWith('/performer/'),
      })) {
        queryClient.setQueryData<PerformerData>(query.queryKey, oldData => {
          if (!oldData?.events) {
            return oldData;
          }
          const nextEvents = oldData.events.filter(e => e.eventID !== eventID);
          return nextEvents.length === oldData.events.length ? oldData : {...oldData, events: nextEvents};
        });
      }
    },
    [queryClient, eventDetailQueryKey],
  );

  /**
   * Insert (when favoriting) or remove (when unfavoriting) an event from
   * `/events` caches whose `dayplanner: true` filter would include/exclude
   * it. Dayplanner lists only contain favorited/followed events, so a plain
   * in-place field update isn't enough to keep them correct.
   */
  const updateDayPlannerCaches = useCallback(
    (event: EventData, isFavorite: boolean) => {
      const eventCruiseDay = computeCruiseDay(event.startTime);
      const matchesQuery = (params: Record<string, unknown> | undefined) => {
        if (!params?.dayplanner) {
          return false;
        }
        const cruiseDayParam = params.cruiseday as number | string | undefined;
        return (
          cruiseDayParam === undefined || eventCruiseDay === undefined || Number(cruiseDayParam) === eventCruiseDay
        );
      };

      for (const query of queryClient.getQueryCache().findAll({queryKey: ['/events']})) {
        const params = query.queryKey[1] as Record<string, unknown> | undefined;
        if (!matchesQuery(params)) {
          continue;
        }
        queryClient.setQueryData<EventData[]>(query.queryKey, oldData => {
          if (!oldData) {
            return oldData;
          }
          return isFavorite ? insertSortedByStartTime(oldData, event) : removeByEventID(oldData, event.eventID);
        });
      }
    },
    [queryClient, computeCruiseDay],
  );

  /**
   * After an event's photographer state changes, move the already-updated event into or out of the lists whose
   * membership depends on it: `/events` caches filtered on `hasPhotographer` (the Shutternaut Calendar). See
   * PhotographerCacheReduction for the rules. The coverage report is deliberately not reduced; see
   * "Optimistic Cache Updates" in docs/Cache and State.md.
   */
  const updatePhotographerCaches = useCallback(
    (event: EventData) => {
      const eventCruiseDay = computeCruiseDay(event.startTime);
      for (const query of queryClient.getQueryCache().findAll({queryKey: ['/events']})) {
        const params = query.queryKey[1] as Record<string, unknown> | undefined;
        const belongs = photographerListMembership(params, event, eventCruiseDay);
        if (belongs === undefined) {
          continue;
        }
        queryClient.setQueryData<EventData[]>(query.queryKey, oldData => {
          if (!oldData) {
            return oldData;
          }
          return belongs ? insertSortedByStartTime(oldData, event) : removeByEventID(oldData, event.eventID);
        });
      }
    },
    [queryClient, computeCruiseDay],
  );

  /**
   * Seed the `/events/{eventID}` detail cache with a complete EventData the
   * caller already has in hand (e.g. from a list response). No network
   * request is made; EventScreen will still background-refetch per its
   * normal staleness rules.
   */
  const primeEventDetail = useCallback(
    (event: EventData) => {
      queryClient.setQueryData<EventData>(eventDetailQueryKey(event.eventID), event);
    },
    [queryClient, eventDetailQueryKey],
  );

  /**
   * Update isFavorite for an event in all list, detail, and performer
   * caches. Also inserts into (or removes from) matching dayplanner caches,
   * and primes the detail cache with the resulting EventData.
   */
  const updateFavorite = useCallback(
    (event: EventData, newValue: boolean) => {
      void queryClient.cancelQueries({queryKey: ['/events']});
      void queryClient.cancelQueries({queryKey: eventDetailQueryKey(event.eventID)});
      const updatedEvent: EventData = {...event, isFavorite: newValue};
      updateEventInAllCaches(event.eventID, e => ({...e, isFavorite: newValue}));
      updateDayPlannerCaches(updatedEvent, newValue);
      primeEventDetail(updatedEvent);
    },
    [queryClient, eventDetailQueryKey, updateEventInAllCaches, updateDayPlannerCaches, primeEventDetail],
  );

  /**
   * Set whether the current user is photographing an event, across all list, detail, and performer caches.
   * Both `userIsPhotographer` and the `photographers` list change, using `selfHeader` (the user's own
   * profile header) for the list entry, so the event screen and the schedule's photographer filters agree
   * with every other cache. Also moves the event into or out of photographer-dependent lists (see
   * updatePhotographerCaches).
   */
  const updatePhotographer = useCallback(
    (event: EventData, newValue: boolean, selfHeader: UserHeader | undefined) => {
      const update = (e: EventData) => withUserPhotographing(e, newValue, selfHeader, currentUserID);
      updateEventInAllCaches(event.eventID, update);
      updatePhotographerCaches(update(event));
    },
    [updateEventInAllCaches, updatePhotographerCaches, currentUserID],
  );

  /**
   * Update shutternautData.needsPhotographer for an event across all caches, and move it into or out of
   * photographer-dependent lists (see updatePhotographerCaches).
   */
  const updateNeedsPhotographer = useCallback(
    (event: EventData, newValue: boolean) => {
      const update = (e: EventData): EventData =>
        e.shutternautData ? {...e, shutternautData: {...e.shutternautData, needsPhotographer: newValue}} : e;
      updateEventInAllCaches(event.eventID, update);
      updatePhotographerCaches(update(event));
    },
    [updateEventInAllCaches, updatePhotographerCaches],
  );

  /** Replace an EventData wholesale (by eventID) in all list, detail, and performer caches. */
  const updateEvent = useCallback(
    (event: EventData) => updateEventInAllCaches(event.eventID, () => event),
    [updateEventInAllCaches],
  );

  /** Remove an event from every cache it may appear in (list, detail, performer-embedded). */
  const removeEvent = useCallback((eventID: string) => removeEventInAllCaches(eventID), [removeEventInAllCaches]);

  /**
   * Add (or replace, matching by id) a performer header in an event's
   * `performers` list across all caches.
   */
  const upsertPerformerInEvent = useCallback(
    (eventID: string, performer: PerformerHeaderData) => {
      updateEventInAllCaches(eventID, event => {
        const exists = event.performers.some(p => p.id === performer.id);
        return {
          ...event,
          performers: exists
            ? event.performers.map(p => (p.id === performer.id ? performer : p))
            : [...event.performers, performer],
        };
      });
    },
    [updateEventInAllCaches],
  );

  /** Remove a performer (by id) from an event's `performers` list across all caches. */
  const removePerformerFromEvent = useCallback(
    (eventID: string, performerID: string | undefined) => {
      updateEventInAllCaches(eventID, event => ({
        ...event,
        performers: event.performers.filter(p => p.id !== performerID),
      }));
    },
    [updateEventInAllCaches],
  );

  return {
    primeEventDetail,
    removeEvent,
    removePerformerFromEvent,
    updateEvent,
    updateFavorite,
    updateNeedsPhotographer,
    updatePhotographer,
    upsertPerformerInEvent,
  };
};
