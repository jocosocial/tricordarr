import {ForumSearchData} from '../../../libraries/Structs/ControllerStructs';
import {useTokenAuthPaginationQuery} from '../TokenAuthQuery';

export interface ForumSearchQueryParams {
  start?: number;
  limit?: number;
  sort?: 'create' | 'update' | 'title';
  search?: string;
  creator?: string;
  creatorid?: string;
}

export const useForumSearchQuery = (queryParams?: ForumSearchQueryParams, options = {}) => {
  return useTokenAuthPaginationQuery<ForumSearchData>('/forum/search', options, queryParams);
};
