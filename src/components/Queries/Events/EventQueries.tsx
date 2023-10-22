import {ErrorResponse, EventData} from '../../../libraries/Structs/ControllerStructs';
import {useQuery} from '@tanstack/react-query';
import axios, {AxiosError} from 'axios';

interface EventsQueryOptions {
  cruiseDay?: number;
  day?: string;
  date?: Date;
  time?: Date;
  eventType?: string;
  search?: string;
}

export const useEventsQuery = ({cruiseDay, day, date, time, eventType, search}: EventsQueryOptions) => {
  return useQuery<[EventData], AxiosError<ErrorResponse>>(['/events'], async () => {
    const queryParams = {
      ...(cruiseDay && {cruiseday: cruiseDay}),
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
  });
};
