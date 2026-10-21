import {UserMatchSort} from '#src/Enums/UserMatchSort';
import {TokenAuthQueryOptionsType, useTokenAuthQuery} from '#src/Queries/TokenAuthQuery';
import {ProfilePublicData, UserHeader} from '#src/Structs/ControllerStructs';

export const useUsersProfileQuery = (userID: string, options?: TokenAuthQueryOptionsType<ProfilePublicData>) => {
  return useTokenAuthQuery<ProfilePublicData>(`/users/${userID}/profile`, options);
};

interface UserMatchQueryProps {
  searchQuery: string;
  /** Restrict results to users who have favorited you. Distinct from sorting. */
  favorers?: boolean;
  /** Ordering of the results. Omitted from the request when undefined, leaving the server default. */
  sort?: UserMatchSort;
  autoSearchLength?: number;
  options?: TokenAuthQueryOptionsType<UserHeader[]>;
}

/**
 * Search for users by a partial match against any of their names.
 */
export const useUserMatchQuery = ({
  searchQuery,
  favorers,
  sort,
  autoSearchLength = 2,
  options,
}: UserMatchQueryProps) => {
  return useTokenAuthQuery<UserHeader[]>(
    `/users/match/allnames/${searchQuery}`,
    {
      ...(autoSearchLength !== undefined ? {enabled: searchQuery.length >= autoSearchLength} : {}),
      ...options,
    },
    {
      ...(favorers !== undefined && {favorers: favorers}),
      ...(sort !== undefined && {sort: sort}),
    },
  );
};

/**
 * Lookup a user by exact username. A miss is an HTTP 404 and is not retried.
 */
export const useUserFindQuery = (username: string, options?: TokenAuthQueryOptionsType<UserHeader>) => {
  return useTokenAuthQuery<UserHeader>(`/users/find/${username}`, options);
};
