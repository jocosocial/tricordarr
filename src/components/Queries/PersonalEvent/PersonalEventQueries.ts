import {useTokenAuthPaginationQuery} from '../TokenAuthQuery.ts';
import {FezListData} from '../../../libraries/Structs/ControllerStructs.tsx';
import {FezType} from '../../../libraries/Enums/FezType.ts';

interface FezJoinedQueryParams {
  cruiseDay?: number;
  includeType?: FezType[];
  excludeType?: FezType[];
  onlyNew?: boolean;
  start?: number;
  limit?: number;
  search?: string;
  hidePast?: boolean;
  matchID?: string;
  lfgTypes?: boolean;
}

interface PersonalEventsQueryOptions extends FezJoinedQueryParams {
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
  includeType = [FezType.privateEvent, FezType.personalEvent],
}: PersonalEventsQueryOptions) => {
  return useTokenAuthPaginationQuery<FezListData>('/fez/joined', options, {
    ...(cruiseDay !== undefined && {cruiseday: cruiseDay}),
    type: includeType,
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
