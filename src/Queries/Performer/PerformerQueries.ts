import {useOpenPaginationQuery, useOpenQuery} from '#src/Queries/OpenQuery';
import {PaginationQueryOptionsType} from '#src/Queries/Pagination';
import {useTokenAuthQuery} from '#src/Queries/TokenAuthQuery';
import {PerformerData, PerformerResponseData} from '#src/Structs/ControllerStructs';

export type PerformerType = 'official' | 'shadow';

interface PerformersQueryOptions {
  performerType: PerformerType;
  search?: string;
  options?: PaginationQueryOptionsType<PerformerResponseData>;
}

/**
 * Paginated list of official or shadow performers. Swiftarr supports an optional
 * ?search= param on both endpoints, which the performer search screen uses.
 *
 * Optional-auth: swiftarr registers `/performer/official`, `/performer/shadow` and
 * `/performer/:id` on `flexRoutes` and marks them `setUsedForPreregistration()`, so these
 * screens have to work for a logged-out user browsing during pre-registration.
 */
export const usePerformersQuery = ({performerType, search, options}: PerformersQueryOptions) => {
  return useOpenPaginationQuery<PerformerResponseData>(`/performer/${performerType}`, options, {
    ...(search && search.trim() && {search: search.trim()}),
  });
};

/** Optional-auth, like the lists above. */
export const usePerformerQuery = (performer: string) => {
  return useOpenQuery<PerformerData>(`/performer/${performer}`);
};

export const usePerformerSelfQuery = () => {
  return useTokenAuthQuery<PerformerData>('/performer/self');
};
