import {useTokenAuthQuery} from './TokenAuthQuery.ts';
import {EventData, PersonalEventData} from '../../libraries/Structs/ControllerStructs.tsx';
import axios from 'axios';

interface PersonalEventsQueryOptions {
  cruiseDay?: number;
  date?: Date;
  time?: Date;
  joined?: boolean;
  owned?: boolean;
  options?: {};
}

export const usePersonalEventsQuery = ({
  cruiseDay,
  joined,
  owned,
  date,
  time,
  options = {},
}: PersonalEventsQueryOptions) => {
  return useTokenAuthQuery<PersonalEventData[]>({
    queryKey: ['/personalevents', {cruiseDay: cruiseDay, joined: joined, owned: owned, date: date, time: time}],
    queryFn: async () => {
      const queryParams = {
        ...(cruiseDay !== undefined && {cruiseday: cruiseDay}),
        ...(date && {date: date.toISOString()}),
        ...(time && {time: time.toISOString()}),
        ...(joined && {joined: joined}),
        ...(owned && {owned: owned}),
      };
      const {data: responseData} = await axios.get<[PersonalEventData]>('/personalevents', {
        params: queryParams,
      });
      return responseData;
    },
    ...options,
  });
};

export const usePersonalEventQuery = ({eventID}: {eventID: string}) => {
  return useTokenAuthQuery<PersonalEventData>({
    queryKey: [`/personalevents/${eventID}`],
  });
};
