import {useTokenAuthPaginationQuery} from '#src/Queries/TokenAuthQuery';
import {ForumSearchData} from '#src/Structs/ControllerStructs';

export interface ForumRelationQueryParams {
  start?: number;
  limit?: number;
  cat?: string;
  sort?: 'create' | 'update' | 'title';
}

export enum ForumRelationQueryType {
  owner = 'owner',
  favorites = 'favorites',
  mutes = 'mutes',
  /** Recent means recently marked as read, not recently viewed. */
  recent = 'recent',
  unread = 'unread',
}

export const useForumRelationQuery = (relation: ForumRelationQueryType, queryParams?: ForumRelationQueryParams) => {
  return useTokenAuthPaginationQuery<ForumSearchData, ForumRelationQueryParams>(
    `/forum/${relation}`,
    undefined,
    queryParams,
  );
};
