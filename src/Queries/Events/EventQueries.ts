import {EventData} from '#src/Structs/ControllerStructs';
import {useTokenAuthQuery} from '#src/Queries/TokenAuthQuery';

interface EventsQueryOptions {
  cruiseDay?: number;
  day?: string;
  date?: Date;
  time?: Date;
  eventType?: 'official' | 'shadow';
  search?: string;
  options?: {};
}

export const useEventsQuery = ({cruiseDay, day, date, time, eventType, search, options = {}}: EventsQueryOptions) => {
  return useTokenAuthQuery<EventData[]>('/events', options, {
    ...(cruiseDay !== undefined && {cruiseday: cruiseDay}),
    ...(day && {day: day}),
    ...(date && {date: date.toISOString()}),
    ...(time && {time: time.toISOString()}),
    ...(eventType && {type: eventType}),
    ...(search && {search: search}),
  });
};

export const useEventQuery = ({eventID}: {eventID: string}) => {
  return useTokenAuthQuery<EventData>(`/events/${eventID}`);
};
