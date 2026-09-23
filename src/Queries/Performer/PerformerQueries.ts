import {
  TokenAuthPaginationQueryOptionsTypeV2,
  useTokenAuthPaginationQuery,
  useTokenAuthQuery,
} from '#src/Queries/TokenAuthQuery';
import {PerformerData, PerformerResponseData} from '#src/Structs/ControllerStructs';

export type PerformerType = 'official' | 'shadow';

interface PerformersQueryOptions {
  performerType: PerformerType;
  search?: string;
  options?: TokenAuthPaginationQueryOptionsTypeV2<PerformerResponseData>;
}

/**
 * Paginated list of official or shadow performers. Swiftarr supports an optional
 * ?search= param on both endpoints, which the performer search screen uses.
 */
export const usePerformersQuery = ({performerType, search, options}: PerformersQueryOptions) => {
  return useTokenAuthPaginationQuery<PerformerResponseData>(`/performer/${performerType}`, options, {
    ...(search && search.trim() && {search: search.trim()}),
  });
};

export const usePerformerQuery = (performer: string) => {
  return useTokenAuthQuery<PerformerData>(`/performer/${performer}`);
};

export const usePerformerSelfQuery = () => {
  return useTokenAuthQuery<PerformerData>('/performer/self');
};
