import {isAxiosError} from 'axios';

import {useSwiftarrQueryClient} from '#src/Context/Contexts/SwiftarrQueryClientContext';
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

/**
 * Returns true when the error is an HTTP 404 from Axios.
 */
function isNotFoundError(error: unknown): boolean {
  return isAxiosError(error) && error.response?.status === 404;
}

/**
 * Lookup a user by exact username.
 * This endpoint returns 404 when no user matches; that is treated as not-found
 * (`null`) rather than a failed query, so React Query will not retry it.
 * Other queries keep the default client retry/error behavior for 404s.
 */
export const useUserFindQuery = (username: string, options?: TokenAuthQueryOptionsType<UserHeader | null>) => {
  const {apiGet} = useSwiftarrQueryClient();
  return useTokenAuthQuery<UserHeader | null>(`/users/find/${username}`, {
    queryFn: async () => {
      try {
        const response = await apiGet<UserHeader, undefined>(`/users/find/${username}`);
        return response.data;
      } catch (error) {
        if (isNotFoundError(error)) {
          return null;
        }
        throw error;
      }
    },
    ...options,
  });
};
