import {useTokenAuthPaginationQuery, useTokenAuthQuery} from '../TokenAuthQuery';
import {CategoryData, ForumData, Paginator} from '../../../libraries/Structs/ControllerStructs';
import {useAuth} from '../../Context/Contexts/AuthContext';
import {useInfiniteQuery} from '@tanstack/react-query';
import axios, {AxiosResponse} from 'axios';
import {ForumSortOrder} from '../../../libraries/Enums/ForumSortFilter';
import {getNextPageParam, getPreviousPageParam} from '../Pagination';

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
export const useForumCategoryQuery = (
  categoryId: string,
  queryParams: ForumCategoryQueryParams = {},
  pageSize = 50,
) => {
  const {isLoggedIn} = useAuth();
  return useInfiniteQuery<CategoryDataQueryResponse>(
    [`/forum/categories/${categoryId}`, queryParams],
    async ({pageParam = {start: queryParams.start || 0, limit: pageSize}}): Promise<CategoryDataQueryResponse> => {
      console.log('Query Page Param', pageParam);
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
    {
      enabled: isLoggedIn,
      getNextPageParam: lastPage => getNextPageParam(lastPage.paginator),
      getPreviousPageParam: firstPage => getPreviousPageParam(firstPage.paginator),
    },
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
