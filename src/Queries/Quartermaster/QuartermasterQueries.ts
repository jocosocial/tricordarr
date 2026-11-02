import {QuartermasterCategory} from '#src/Enums/QuartermasterCategory';
import {getQuartermasterItemEndpoint} from '#src/Queries/Quartermaster/QuartermasterCacheKeys';
import {useTokenAuthPaginationQuery, useTokenAuthQuery} from '#src/Queries/TokenAuthQuery';
import {QuartermasterData, QuartermasterListData} from '#src/Structs/ControllerStructs';

interface QuartermasterListQueryOptions {
  category: QuartermasterCategory;
  mine?: boolean;
  search?: string;
  enabled?: boolean;
}

/**
 * Paginated Quartermastarr items in a category, optionally limited to the current user's own
 * items and/or a full-text search.
 *
 * Params are only included when set so that the query key is canonical -- the cache reducer
 * judges each cached list on `queryKey[1]`.
 */
export const useQuartermasterListQuery = ({category, mine, search, enabled = true}: QuartermasterListQueryOptions) => {
  const queryParams = {
    category,
    ...(mine && {mine: true}),
    ...(search && {search}),
  };
  return useTokenAuthPaginationQuery<QuartermasterListData>('/quartermaster', {enabled}, queryParams);
};

/**
 * A single Quartermastarr item.
 */
export const useQuartermasterItemQuery = (itemID?: string) => {
  return useTokenAuthQuery<QuartermasterData>(getQuartermasterItemEndpoint(itemID ?? ''), {enabled: !!itemID});
};
