import {useTokenAuthPaginationQuery, useTokenAuthQuery} from '../TokenAuthQuery';
import {CategoryData} from '../../../libraries/Structs/ControllerStructs';
import {ForumSort, ForumSortDirection} from '../../../libraries/Enums/ForumSortFilter';
import {WithPaginator} from '../Pagination';
import {useConfig} from '../../Context/Contexts/ConfigContext';
import {useSwiftarrQueryClient} from '../../Context/Contexts/SwiftarrQueryClientContext.ts';

export const useForumCategoriesQuery = () => {
  return useTokenAuthQuery<CategoryData[]>('/forum/categories');
};

export interface ForumCategoryQueryParams {
  sort?: ForumSort;
  start?: number;
  limit?: number;
  afterdate?: string; // mutually exclusive
  beforedate?: string; // mutually exclusive
  order?: ForumSortDirection;
}

// https://github.com/jocosocial/swiftarr/issues/236
export interface CategoryDataQueryResponse extends CategoryData, WithPaginator {}

export const useForumCategoryQuery = (categoryId: string, queryParams: ForumCategoryQueryParams = {}) => {
  const {appConfig} = useConfig();
  const {apiGet} = useSwiftarrQueryClient();
  return useTokenAuthPaginationQuery<CategoryDataQueryResponse, ForumCategoryQueryParams>(
    `/forum/categories/${categoryId}`,
    {
      queryFn: async ({
        pageParam = {start: queryParams.start || 0, limit: appConfig.apiClientConfig.defaultPageSize},
      }): Promise<CategoryDataQueryResponse> => {
        const {data: responseData} = await apiGet<CategoryData, ForumCategoryQueryParams>({
          url: `/forum/categories/${categoryId}`,
          queryParams: {
            ...(pageParam.start ? {start: pageParam.start} : undefined),
            ...(pageParam.limit ? {limit: pageParam.limit} : undefined),
            ...(queryParams.sort ? {sort: queryParams.sort} : undefined),
            ...(queryParams.afterdate ? {afterdate: queryParams.afterdate} : undefined),
            ...(queryParams.beforedate ? {beforedate: queryParams.beforedate} : undefined),
            ...(queryParams.order ? {order: queryParams.order} : undefined),
          },
        });
        return {
          ...responseData,
          paginator: {
            total: responseData.numThreads,
            start: pageParam.start,
            limit: pageParam.limit,
          },
        };
      },
    },
    queryParams,
  );
};
