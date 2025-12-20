import {TokenAuthQueryOptionsType, useTokenAuthQuery} from '#src/Queries/TokenAuthQuery';
import {ProfilePublicData, UserHeader} from '#src/Structs/ControllerStructs';

export const useUsersProfileQuery = (userID: string, options?: TokenAuthQueryOptionsType<ProfilePublicData>) => {
  return useTokenAuthQuery<ProfilePublicData>(`/users/${userID}/profile`, options);
};

interface UserMatchQueryProps {
  searchQuery: string;
  favorers?: boolean;
  autoSearchLength?: number;
  options?: TokenAuthQueryOptionsType<UserHeader[]>;
}

export const useUserMatchQuery = ({searchQuery, favorers, autoSearchLength = 2, options}: UserMatchQueryProps) => {
  return useTokenAuthQuery<UserHeader[]>(
    `/users/match/allnames/${searchQuery}`,
    {
      ...(autoSearchLength !== undefined ? {enabled: searchQuery.length >= autoSearchLength} : {}),
      ...options,
    },
    {
      ...(favorers !== undefined && {favorers: favorers}),
    },
  );
};

export const useUserFindQuery = (username: string, options?: TokenAuthQueryOptionsType<UserHeader>) => {
  return useTokenAuthQuery<UserHeader>(`/users/find/${username}`, options);
};
