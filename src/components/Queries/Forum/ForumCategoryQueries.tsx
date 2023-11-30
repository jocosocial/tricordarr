import {useTokenAuthPaginationQuery, useTokenAuthQuery} from '../TokenAuthQuery';
import {CategoryData, ForumData} from '../../../libraries/Structs/ControllerStructs';
import {useAuth} from '../../Context/Contexts/AuthContext';
import {useInfiniteQuery} from '@tanstack/react-query';
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

// https://github.com/jocosocial/swiftarr/issues/236
export const useForumCategoryQuery = (
  categoryId: string,
  queryParams: ForumCategoryQueryParams = {},
  pageSize = 50,
) => {
  const {isLoggedIn} = useAuth();
  return useInfiniteQuery<CategoryData>(
    [`/forum/categories/${categoryId}`, queryParams],
    async ({pageParam = {start: queryParams.start, limit: pageSize}}) => {
      const {data: responseData} = await axios.get<CategoryData, AxiosResponse<CategoryData>>(
        `/forum/categories/${categoryId}`,
        {
          params: {
            limit: pageParam.limit,
            start: pageParam.start,
            ...(queryParams.sort ? {sort: queryParams.sort} : undefined),
            ...(queryParams.afterdate ? {afterdate: queryParams.afterdate} : undefined),
            ...(queryParams.beforedate ? {beforedate: queryParams.beforedate} : undefined),
          },
        },
      );
      return responseData;
    },
    {
      enabled: isLoggedIn,
      getNextPageParam: (lastPage, allPages) => {
        const {numThreads} = lastPage;
        const nextStart = pageSize * allPages.length;
        return nextStart < numThreads ? {start: nextStart, limit: pageSize} : undefined;
      },
      getPreviousPageParam: (firstPage, allPages) => {
        const start = pageSize * allPages.length;
        const prevStart = start - pageSize;
        return prevStart >= 0 ? {start: prevStart, limit: pageSize} : undefined;
      },
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
