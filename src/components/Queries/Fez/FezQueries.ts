import {FezData, FezListData} from '../../../libraries/Structs/ControllerStructs';
import {PrivilegedUserAccounts} from '../../../libraries/Enums/UserAccessLevel';
import {FezType} from '../../../libraries/Enums/FezType';
import {useTokenAuthPaginationQuery} from '../TokenAuthQuery';
import {FezListEndpoints} from '../../../libraries/Types';

// https://medium.com/@deshan.m/reusable-react-query-hooks-with-typescript-simplifying-api-calls-f2583b24c82a
interface FezQueryProps {
  fezID: string;
}

/**
 * Gets a single Fez Chat.
 * @param fezID String of the Fez Chat ID.
 */
export const useFezQuery = ({fezID}: FezQueryProps) => {
  return useTokenAuthPaginationQuery<FezData>(`/fez/${fezID}`);
};

// Mostly mirrors https://github.com/jocosocial/swiftarr/blob/master/Sources/swiftarr/Controllers/FezController.swift
interface FezListQueryOptions {
  cruiseDay?: number;
  fezType?: FezType | FezType[];
  hidePast?: boolean;
  endpoint?: FezListEndpoints;
  excludeFezType?: FezType | FezType[];
  options?: {};
  lfgTypesOnly?: boolean;
  onlyNew?: boolean;
  search?: string;
  matchID?: string;
  forUser?: keyof typeof PrivilegedUserAccounts;
  archived?: boolean;
}

export const useFezListQuery = ({
  cruiseDay,
  fezType,
  hidePast,
  endpoint,
  excludeFezType,
  options,
  onlyNew,
  search,
  matchID,
  forUser,
  archived,
}: FezListQueryOptions) => {
  const queryParams = {
    // Heads up, Swiftarr is case-sensitive with query params. forUser != foruser.
    // The !== undefined is necessary because 0 is false-y.
    ...(cruiseDay !== undefined && {cruiseday: cruiseDay}),
    ...(fezType !== undefined && {type: fezType}),
    ...(hidePast !== undefined && {hidePast: hidePast}),
    ...(excludeFezType && {excludetype: excludeFezType}),
    // lfgtypes is mutually exclusive with type.
    // lfgtypes: lfgTypesOnly,
    ...(onlyNew !== undefined && {onlynew: onlyNew}),
    ...(search && {search: search}),
    ...(matchID && {matchID: matchID}),
    ...(forUser !== undefined && {foruser: forUser.toLowerCase()}),
    ...(archived !== undefined && {archived: archived}),
  };
  return useTokenAuthPaginationQuery<FezListData>(`/fez/${endpoint}`, options, queryParams);
};

export const useLfgListQuery = ({
  cruiseDay,
  fezType,
  hidePast,
  endpoint = 'open',
  options,
  onlyNew,
  search,
  matchID,
}: FezListQueryOptions) => {
  return useFezListQuery({
    cruiseDay,
    fezType,
    hidePast,
    endpoint,
    excludeFezType: [FezType.privateEventTypes, FezType.seamailTypes].flat(),
    options,
    lfgTypesOnly: true,
    onlyNew,
    search,
    matchID,
  });
};

export const useSeamailListQuery = ({
  cruiseDay,
  hidePast,
  endpoint = 'joined',
  options,
  onlyNew,
  search,
  matchID,
  forUser,
  archived,
}: FezListQueryOptions) => {
  return useFezListQuery({
    cruiseDay,
    fezType: FezType.seamailTypes,
    hidePast,
    endpoint,
    options,
    onlyNew,
    search,
    matchID,
    forUser,
    archived,
  });
};

export const usePersonalEventsQuery = ({
  cruiseDay,
  excludeFezType,
  onlyNew,
  search,
  hidePast,
  matchID,
  options = {},
  fezType = [FezType.privateEvent, FezType.personalEvent],
}: FezListQueryOptions) => {
  return useFezListQuery({
    cruiseDay,
    excludeFezType,
    fezType,
    hidePast,
    endpoint: 'joined',
    options,
    onlyNew,
    search,
    matchID,
  });
};
