import {TokenAuthQueryOptionsType, useTokenAuthQuery} from '#src/Queries/TokenAuthQuery';
import {EventData} from '#src/Structs/ControllerStructs';

interface EventsQueryOptions {
  cruiseDay?: number;
  day?: string;
  date?: Date;
  time?: Date;
  eventType?: 'official' | 'shadow';
  search?: string;
  dayplanner?: boolean;
  options?: TokenAuthQueryOptionsType<EventData[]>;
}

export const useEventsQuery = ({
  cruiseDay,
  day,
  date,
  time,
  eventType,
  search,
  dayplanner,
  options,
}: EventsQueryOptions) => {
  return useTokenAuthQuery<EventData[]>('/events', options, {
    ...(cruiseDay !== undefined && {cruiseday: cruiseDay}),
    ...(day && {day: day}),
    ...(date && {date: date.toISOString()}),
    ...(time && {time: time.toISOString()}),
    ...(eventType && {type: eventType}),
    ...(search && {search: search}),
    ...(dayplanner && {dayplanner: true}),
  });
};

export const useEventQuery = ({eventID}: {eventID: string}) => {
  return useTokenAuthQuery<EventData>(`/events/${eventID}`);
};
