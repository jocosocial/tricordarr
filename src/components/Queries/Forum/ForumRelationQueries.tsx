import {useTokenAuthMutation} from '../TokenAuthMutation';
import axios, {AxiosResponse} from 'axios/index';
import {useTokenAuthPaginationQuery} from '../TokenAuthQuery';
import {ForumSearchData} from '../../../libraries/Structs/ControllerStructs';

interface ForumRelationCreateProps {
  forumID: string;
  relationType: 'favorite' | 'mute';
  action: 'create' | 'delete';
}

const relationQueryHandler = async ({
  forumID,
  relationType,
  action,
}: ForumRelationCreateProps): Promise<AxiosResponse<void>> => {
  if (action === 'delete') {
    return await axios.delete(`/forum/${forumID}/${relationType}`);
  }
  return await axios.post(`/forum/${forumID}/${relationType}`);
};

export const useForumRelationMutation = () => {
  return useTokenAuthMutation(relationQueryHandler);
};

export interface ForumFavoritesQueryParams {
  start?: number;
  limit?: number;
  cat?: string;
  sort?: 'create' | 'update' | 'title';
}

export enum ForumRelationQueryType {
  owner = 'owner',
  favorites = 'favorites',
  mutes = 'mutes',
}

export const useForumRelationQuery = (relation: ForumRelationQueryType, queryParams?: ForumFavoritesQueryParams) => {
  return useTokenAuthPaginationQuery<ForumSearchData>(`/forum/${relation}`, undefined, undefined, queryParams);
};

export const useForumRecentQuery = () => {
  return useTokenAuthPaginationQuery<ForumSearchData>('/forum/recent');
};
