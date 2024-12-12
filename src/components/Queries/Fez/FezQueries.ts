import {FezData, FezListData} from '../../../libraries/Structs/ControllerStructs';
import {PrivilegedUserAccounts} from '../../../libraries/Enums/UserAccessLevel';
import {FezType} from '../../../libraries/Enums/FezType';
import {useTokenAuthPaginationQuery} from '../TokenAuthQuery';
import {FezListEndpoints} from '../../../libraries/Types';

// https://medium.com/@deshan.m/reusable-react-query-hooks-with-typescript-simplifying-api-calls-f2583b24c82a

interface SeamailQueryProps {
  fezID: string;
}

interface SeamailListQueryOptions {
  forUser?: keyof typeof PrivilegedUserAccounts;
  search?: string;
  options?: {};
}

export const useSeamailListQuery = ({forUser, search, options = {}}: SeamailListQueryOptions) => {
  const queryParams = {
    search: search,
    // Heads up, Swiftarr is case-sensitive with query params. forUser != foruser.
    ...(forUser !== undefined && {foruser: forUser.toLowerCase()}),
    type: [FezType.closed, FezType.open],
  };
  return useTokenAuthPaginationQuery<FezListData>('/fez/joined', options, queryParams);
};

export const useSeamailQuery = ({fezID}: SeamailQueryProps) => {
  return useTokenAuthPaginationQuery<FezData>(`/fez/${fezID}`);
};

interface LfgListQueryOptions {
  cruiseDay?: number;
  fezType?: keyof typeof FezType;
  hidePast?: boolean;
  endpoint?: FezListEndpoints;
  excludeFezType?: FezType[];
  options?: {};
}

export const useLfgListQuery = ({
  cruiseDay,
  fezType,
  excludeFezType = [FezType.open, FezType.closed],
  hidePast = false,
  endpoint = 'open',
  options = {},
}: LfgListQueryOptions) => {
  const queryParams = {
    // Heads up, Swiftarr is case-sensitive with query params. forUser != foruser.
    // The !== undefined is necessary because 0 is false-y.
    ...(cruiseDay !== undefined && {cruiseday: cruiseDay}),
    ...(fezType !== undefined && {type: fezType}),
    ...(hidePast !== undefined && {hidePast: hidePast}),
    ...(excludeFezType && {excludetype: excludeFezType}),
  };
  return useTokenAuthPaginationQuery<FezListData>(`/fez/${endpoint}`, options, queryParams);
};
