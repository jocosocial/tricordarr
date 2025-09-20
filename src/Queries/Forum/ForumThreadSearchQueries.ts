import {ForumSearchData} from '../../../Libraries/Structs/ControllerStructs';
import {useTokenAuthPaginationQuery} from '#src/Queries/TokenAuthQuery';

export interface ForumSearchQueryParams {
  search?: string;
  category?: string;
  creatorself?: boolean;
  creator?: string;
  creatorid?: string;
  favorite?: boolean;
  mute?: boolean;
  searchposts?: string;
  unread?: boolean;
  posted?: boolean;
  start?: number;
  limit?: number;
  sort?: 'create' | 'update' | 'title';
}

export const useForumSearchQuery = (queryParams?: ForumSearchQueryParams, options = {}) => {
  return useTokenAuthPaginationQuery<ForumSearchData>('/forum/search', options, queryParams);
};
