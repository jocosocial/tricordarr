import {ErrorResponse, EventData} from '../../../libraries/Structs/ControllerStructs';
import {useQuery} from '@tanstack/react-query';
import axios, {AxiosError} from 'axios';

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
  return useQuery<[EventData], AxiosError<ErrorResponse>>(
    ['/events', {cruiseDay: cruiseDay, eventType: eventType}],
    async () => {
      const queryParams = {
        ...(cruiseDay !== undefined && {cruiseday: cruiseDay}),
        ...(day && {day: day}),
        ...(date && {date: date.toISOString()}),
        ...(time && {time: time.toISOString()}),
        ...(eventType && {type: eventType}),
        ...(search && {search: search}),
      };
      const {data: responseData} = await axios.get<[EventData]>('/events', {
        params: queryParams,
      });
      return responseData;
    },
    options,
  );
};

export const useEventQuery = ({eventID}: {eventID: string}) => {
  return useQuery<EventData>([`/events/${eventID}`]);
};

export const useEventFavoriteQuery = () => {
  return useQuery<EventData[]>(['/events/favorites']);
};
