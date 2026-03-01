import {QueryKey} from '@tanstack/react-query';

/**
 * Mode for user relation list screens (favorites, blocks, mutes).
 * Used by UsersListScreen, SearchUsersScreen, and cache reducer.
 */
export type UserRelationMode = 'favorite' | 'block' | 'mute';

export const USER_RELATION_ENDPOINTS: Record<UserRelationMode, string> = {
  favorite: '/users/favorites',
  block: '/users/blocks',
  mute: '/users/mutes',
};

/**
 * Partial query key for the relation list endpoint. Matches the key shape used
 * by useTokenAuthQuery ([endpoint, queryParams, ...queryKeyExtraData]) so
 * setQueriesData can update the list cache.
 */
export const getRelationListQueryKey = (mode: UserRelationMode): QueryKey => [USER_RELATION_ENDPOINTS[mode]];
