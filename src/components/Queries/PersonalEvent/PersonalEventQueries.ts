import {useTokenAuthQuery} from '../TokenAuthQuery.ts';
import {PersonalEventData} from '../../../libraries/Structs/ControllerStructs.tsx';

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
  return useTokenAuthQuery<PersonalEventData[]>('/personalevents', options, {
    ...(cruiseDay !== undefined && {cruiseday: cruiseDay}),
    ...(date && {date: date.toISOString()}),
    ...(time && {time: time.toISOString()}),
    ...(joined && {joined: joined}),
    ...(owned && {owned: owned}),
  });
};

export const usePersonalEventQuery = ({eventID}: {eventID: string}) => {
  return useTokenAuthQuery<PersonalEventData>(`/personalevents/${eventID}`);
};
