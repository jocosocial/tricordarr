import {PostSearchData} from '../../../libraries/Structs/ControllerStructs';
import {useInfiniteQuery} from '@tanstack/react-query';
import axios, {AxiosResponse} from 'axios/index';
import {useAuth} from '../../Context/Contexts/AuthContext';

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
// @TODO combine this with useTokenAuthPaginationQuery when that can take queryKey, function, and options.
export const useForumPostSearchQuery = (queryParams: ForumPostSearchQueryParams = {}, pageSize = 50) => {
  const {isLoggedIn} = useAuth();
  return useInfiniteQuery<PostSearchData>(
    ['/forum/post/search'],
    async ({pageParam = {start: queryParams.start, limit: pageSize}}) => {
      const {data: responseData} = await axios.get<PostSearchData, AxiosResponse<PostSearchData>>(
        '/forum/post/search',
        {
          params: {
            limit: pageParam.limit,
            start: pageParam.start,
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
      return responseData;
    },
    {
      enabled: isLoggedIn,
      getNextPageParam: lastPage => {
        const {limit, start, totalPosts} = lastPage;
        const nextStart = start + limit;
        return nextStart < totalPosts ? {start: nextStart, limit} : undefined;
      },
      getPreviousPageParam: firstPage => {
        const {limit, start} = firstPage;
        const prevStart = start - limit;
        return prevStart >= 0 ? {start: prevStart, limit} : undefined;
      },
    },
  );
};
