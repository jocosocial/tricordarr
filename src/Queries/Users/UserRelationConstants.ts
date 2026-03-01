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

export const USER_RELATION_SCREEN_TITLES: Record<UserRelationMode, string> = {
  favorite: 'Favorite Users',
  block: 'Blocked Users',
  mute: 'Muted Users',
};

export const USER_RELATION_SEARCH_SCREEN_TITLES: Record<UserRelationMode, string> = {
  favorite: 'Add Favorite',
  block: 'Add Block',
  mute: 'Add Mute',
};

export const USER_RELATION_ACTIONS: Record<UserRelationMode, {add: string; remove: string}> = {
  favorite: {add: 'favorite', remove: 'unfavorite'},
  block: {add: 'block', remove: 'unblock'},
  mute: {add: 'mute', remove: 'unmute'},
};

export const USER_RELATION_EMPTY_TEXT: Record<UserRelationMode, string> = {
  favorite: 'You have not favorited any users.',
  block: 'You have not blocked any users.',
  mute: 'You have not muted any users.',
};

export const USER_RELATION_URL_PATHS: Record<UserRelationMode, string> = {
  favorite: '/favorites',
  block: '/blocks',
  mute: '/mutes',
};

/**
 * Partial query key for the relation list endpoint. Matches the key shape used
 * by useTokenAuthQuery ([endpoint, queryParams, ...queryKeyExtraData]) so
 * setQueriesData can update the list cache.
 */
export const getRelationListQueryKey = (mode: UserRelationMode): QueryKey => [USER_RELATION_ENDPOINTS[mode]];
