import {useTokenAuthPaginationQuery, useTokenAuthQuery} from '../TokenAuthQuery.ts';
import {FezData, FezListData} from '../../../libraries/Structs/ControllerStructs.tsx';
import {FezType} from '../../../libraries/Enums/FezType.ts';

interface FezJoinedQueryParams {
  cruiseDay?: number;
  includeType?: [keyof FezType];
  excludeType?: [keyof FezType];
  onlyNew?: boolean;
  start?: number;
  limit?: number;
  search?: string;
  hidePast?: boolean;
  matchID?: string;
  lfgTypes?: boolean;
}

interface PersonalEventsQueryOptions extends Omit<FezJoinedQueryParams, 'includeType'> {
  options?: {};
}

export const usePersonalEventsQuery = ({
  cruiseDay,
  excludeType,
  onlyNew,
  start,
  limit,
  search,
  hidePast,
  matchID,
  lfgTypes,
  options = {},
}: PersonalEventsQueryOptions) => {
  return useTokenAuthPaginationQuery<FezListData>('/fez/joined', options, {
    ...(cruiseDay !== undefined && {cruiseday: cruiseDay}),
    type: [FezType.privateEvent, FezType.personalEvent],
    ...(excludeType && {excludetype: excludeType}),
    ...(onlyNew !== undefined && {onlynew: onlyNew}),
    ...(start !== undefined && {start: start}),
    ...(limit !== undefined && {limit: limit}),
    ...(search && {search: search}),
    ...(hidePast !== undefined && {hidePast: hidePast}),
    ...(matchID && {matchID: matchID}),
    ...(lfgTypes !== undefined && {lfgtypes: lfgTypes}),
  });
};

export const usePersonalEventQuery = ({eventID}: {eventID: string}) => {
  return useTokenAuthQuery<FezData>(`/fez/${eventID}`);
};
