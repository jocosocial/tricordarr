import {useOpenQuery} from '#src/Queries/OpenQuery';
import {EventData} from '#src/Structs/ControllerStructs';

type EventsQueryOpenOptions = Parameters<typeof useOpenQuery<EventData[]>>[1];

interface EventsQueryOptions {
  cruiseDay?: number;
  day?: string;
  date?: Date;
  time?: Date;
  eventType?: 'official' | 'shadow';
  search?: string;
  location?: string;
  dayplanner?: boolean;
  options?: EventsQueryOpenOptions;
}

/**
 * List/search the public schedule. Swiftarr GETs are flex routes (optional auth), so this uses
 * `useOpenQuery`. `isFavorite` on each result is `false` for a logged-out request, and the
 * `dayplanner` param's personalized fields require a token; callers must hide/gate the UI that
 * would need those while logged out (see ScheduleDayScreen's LFG/personal-event/day-planner bits).
 */
export const useEventsQuery = ({
  cruiseDay,
  day,
  date,
  time,
  eventType,
  search,
  location,
  dayplanner,
  options,
}: EventsQueryOptions) => {
  return useOpenQuery<EventData[]>('/events', options, {
    ...(cruiseDay !== undefined && {cruiseday: cruiseDay}),
    ...(day && {day: day}),
    ...(date && {date: date.toISOString()}),
    ...(time && {time: time.toISOString()}),
    ...(eventType && {type: eventType}),
    ...(search && {search: search}),
    ...(location && {location: location}),
    ...(dayplanner && {dayplanner: true}),
  });
};

/**
 * Single event. Flex auth, same as useEventsQuery.
 */
export const useEventQuery = ({eventID}: {eventID: string}) => {
  return useOpenQuery<EventData>(`/events/${eventID}`);
};
