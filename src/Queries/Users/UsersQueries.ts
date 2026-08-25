import {useSwiftarrQueryClient} from '#src/Context/Contexts/SwiftarrQueryClientContext';
import {isNotFoundError} from '#src/Libraries/Network/QueryRetry';
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
 * Lookup a user by exact username. A 404 is an acceptable not-found and resolves
 * to `null` instead of throwing, so React Query will not retry it.
 * Callers may still override query options (retry, enabled, queryFn, etc.).
 */
export const useUserFindQuery = (username: string, options?: TokenAuthQueryOptionsType<UserHeader | null>) => {
  const {apiGet} = useSwiftarrQueryClient();
  return useTokenAuthQuery<UserHeader | null>(`/users/find/${username}`, {
    queryFn: async () => {
      try {
        const response = await apiGet<UserHeader>(`/users/find/${username}`);
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
