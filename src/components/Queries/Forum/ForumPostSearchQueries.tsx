import {PostSearchData} from '../../../libraries/Structs/ControllerStructs';
import {WithPaginator} from '../Pagination';
import {useTokenAuthPaginationQuery} from '../TokenAuthQuery';
import axios, {AxiosResponse} from 'axios';

export interface ForumPostSearchQueryParams {
  search?: string;
  hashtag?: string;
  mentionname?: string;
  mentionid?: string;
  mentionself?: boolean;
  ownreacts?: boolean;
  byself?: boolean;
  bookmarked?: boolean;
  forum?: string;
  category?: string;
  start?: number;
  limit?: number;
}

// https://github.com/jocosocial/swiftarr/issues/235
export interface PostSearchDataResponse extends PostSearchData, WithPaginator {}

export const useForumPostSearchQuery = (queryParams: ForumPostSearchQueryParams = {}, pageSize = 50, options = {}) => {
  return useTokenAuthPaginationQuery<PostSearchDataResponse>('/forum/post/search', pageSize, {
    queryFn: async ({pageParam = {start: queryParams.start || 0, limit: pageSize}}) => {
      const {data: responseData} = await axios.get<PostSearchData, AxiosResponse<PostSearchData>>(
        '/forum/post/search',
        {
          params: {
            ...(pageParam.limit ? {limit: pageParam.limit} : undefined),
            ...(pageParam.start ? {start: pageParam.start} : undefined),
            ...(queryParams.search ? {search: queryParams.search} : undefined),
            ...(queryParams.hashtag ? {hashtag: queryParams.hashtag} : undefined),
            ...(queryParams.mentionname ? {mentionname: queryParams.mentionname} : undefined),
            ...(queryParams.mentionid ? {mentionid: queryParams.mentionid} : undefined),
            ...(queryParams.mentionself ? {mentionself: queryParams.mentionself} : undefined),
            ...(queryParams.ownreacts ? {ownreacts: queryParams.ownreacts} : undefined),
            ...(queryParams.byself ? {byself: queryParams.byself} : undefined),
            ...(queryParams.bookmarked ? {bookmarked: queryParams.bookmarked} : undefined),
            ...(queryParams.forum ? {forum: queryParams.forum} : undefined),
            ...(queryParams.category ? {category: queryParams.category} : undefined),
          },
        },
      );
      return {
        ...responseData,
        paginator: {
          total: responseData.totalPosts,
          start: pageParam.start,
          limit: pageParam.limit,
        },
      };
    },
    ...options,
  });
};
