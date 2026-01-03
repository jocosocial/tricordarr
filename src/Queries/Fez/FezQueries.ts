import {FezType} from '#src/Enums/FezType';
import {PrivilegedUserAccounts} from '#src/Enums/UserAccessLevel';
import {TokenAuthPaginationQueryOptionsTypeV2, useTokenAuthPaginationQuery} from '#src/Queries/TokenAuthQuery';
import {FezData, FezListData} from '#src/Structs/ControllerStructs';
import {FezListEndpoints} from '#src/Types';

// https://medium.com/@deshan.m/reusable-react-query-hooks-with-typescript-simplifying-api-calls-f2583b24c82a
interface FezQueryProps {
  fezID: string;
  options?: TokenAuthPaginationQueryOptionsTypeV2<FezData>;
}

/**
 * Gets a single Fez Chat.
 * @param fezID String of the Fez Chat ID.
 */
export const useFezQuery = ({
  fezID,
  options = {refetchOnWindowFocus: 'always', refetchOnMount: 'always'},
}: FezQueryProps) => {
  return useTokenAuthPaginationQuery<FezData>(`/fez/${fezID}`, options);
};

// Mostly mirrors https://github.com/jocosocial/swiftarr/blob/master/Sources/swiftarr/Controllers/FezController.swift
interface FezListQueryOptions {
  cruiseDay?: number;
  fezType?: FezType | FezType[];
  hidePast?: boolean;
  endpoint?: FezListEndpoints;
  excludeFezType?: FezType | FezType[];
  options?: TokenAuthPaginationQueryOptionsTypeV2<FezListData>;
  lfgTypesOnly?: boolean;
  onlyNew?: boolean;
  search?: string;
  matchID?: string;
  forUser?: keyof typeof PrivilegedUserAccounts;
}

export const useFezListQuery = ({
  cruiseDay,
  fezType,
  hidePast,
  endpoint,
  excludeFezType,
  options = {refetchOnWindowFocus: 'always', refetchOnMount: 'always'},
  onlyNew,
  search,
  matchID,
  forUser,
  lfgTypesOnly,
}: FezListQueryOptions) => {
  const queryParams = {
    // Heads up, Swiftarr is case-sensitive with query params. forUser != foruser.
    // The !== undefined is necessary because 0 is false-y.
    ...(cruiseDay !== undefined && {cruiseday: cruiseDay}),
    ...(fezType !== undefined && {type: fezType}),
    ...(hidePast !== undefined && {hidePast: hidePast}),
    ...(excludeFezType && {excludetype: excludeFezType}),
    // lfgtypes is mutually exclusive with type.
    ...(lfgTypesOnly && {lfgtypes: lfgTypesOnly}),
    ...(onlyNew !== undefined && {onlynew: onlyNew}),
    ...(search && {search: search}),
    ...(matchID && {matchID: matchID}),
    ...(forUser !== undefined && {foruser: forUser.toLowerCase()}),
  };
  return useTokenAuthPaginationQuery<FezListData>(`/fez/${endpoint}`, options, queryParams);
};

export const useLfgListQuery = ({
  cruiseDay,
  fezType,
  hidePast = true, // this matches Swiftarr behavior
  endpoint = 'open',
  options = {refetchOnWindowFocus: 'always', refetchOnMount: 'always'},
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
  });
};

export const usePersonalEventsQuery = ({
  cruiseDay,
  excludeFezType,
  onlyNew,
  search,
  hidePast,
  matchID,
  options = {refetchOnWindowFocus: 'always', refetchOnMount: 'always'},
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
