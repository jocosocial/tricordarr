import {EventData} from '../../../libraries/Structs/ControllerStructs';
import axios from 'axios';
import {useTokenAuthQuery} from '../TokenAuthQuery';

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
  return useTokenAuthQuery<EventData[]>({
    queryKey: ['/events', {cruiseDay: cruiseDay, eventType: eventType}],
    queryFn: async () => {
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
    ...options,
  });
};

export const useEventQuery = ({eventID}: {eventID: string}) => {
  return useTokenAuthQuery<EventData>({
    queryKey: [`/events/${eventID}`],
  });
};
