import {useTokenAuthPaginationQuery, useTokenAuthQuery} from '../TokenAuthQuery';
import {CategoryData, ForumData, Paginator} from '../../../libraries/Structs/ControllerStructs';
import axios, {AxiosResponse} from 'axios';
import {ForumSortOrder} from '../../../libraries/Enums/ForumSortFilter';

export const useForumCategoriesQuery = () => {
  return useTokenAuthQuery<CategoryData[]>({
    queryKey: ['/forum/categories'],
  });
};

export interface ForumCategoryQueryParams {
  sort?: ForumSortOrder;
  start?: number;
  limit?: number;
  afterdate?: string; // mutually exclusive
  beforedate?: string; // mutually exclusive
}

export interface CategoryDataQueryResponse extends CategoryData {
  paginator: Paginator;
}

// https://github.com/jocosocial/swiftarr/issues/236
export const useForumCategoryQuery = (categoryId: string, queryParams: ForumCategoryQueryParams = {}) => {
  return useTokenAuthPaginationQuery<CategoryDataQueryResponse>(
    `/forum/categories/${categoryId}`,
    50,
    {
      queryFn: async ({pageParam = {start: queryParams.start || 0, limit: 50}}): Promise<CategoryDataQueryResponse> => {
        const {data: responseData} = await axios.get<CategoryData, AxiosResponse<CategoryData>>(
          `/forum/categories/${categoryId}`,
          {
            params: {
              ...(pageParam.start ? {start: pageParam.start} : undefined),
              ...(pageParam.limit ? {limit: pageParam.limit} : undefined),
              ...(queryParams.sort ? {sort: queryParams.sort} : undefined),
              ...(queryParams.afterdate ? {afterdate: queryParams.afterdate} : undefined),
              ...(queryParams.beforedate ? {beforedate: queryParams.beforedate} : undefined),
            },
          },
        );
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

export const useForumThreadQuery = (forumID?: string, postID?: string) => {
  if (!forumID && !postID) {
    throw new Error('Invalid usage of useForumThreadQuery()');
  }
  let endpoint = `/forum/${forumID}`;
  if (postID) {
    endpoint = `/forum/post/${postID}/forum`;
  }
  return useTokenAuthPaginationQuery<ForumData>(endpoint);
};
