import {PostSearchData} from '#src/Structs/ControllerStructs';
import {useTokenAuthPaginationQuery} from '#src/Queries/TokenAuthQuery';

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
  creatorid?: string;
}

export const useForumPostSearchQuery = (queryParams: ForumPostSearchQueryParams = {}, options = {}) => {
  return useTokenAuthPaginationQuery<PostSearchData>('/forum/post/search', options, queryParams);
};
