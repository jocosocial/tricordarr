import {useOpenPaginationQuery, useOpenQuery} from '#src/Queries/OpenQuery';
import {TokenAuthPaginationQueryOptionsTypeV2} from '#src/Queries/TokenAuthQuery';
import {BoardgameData, BoardgameResponseData} from '#src/Structs/ControllerStructs';

interface BoardgamesQueryOptions {
  search?: string;
  favorite?: boolean;
  options?: TokenAuthPaginationQueryOptionsTypeV2<BoardgameResponseData>;
}

interface BoardgameQueryOptions {
  boardgameID: string;
  options?: TokenAuthPaginationQueryOptionsTypeV2<BoardgameResponseData>;
}

interface BoardgameRecommendQueryOptions {
  options?: TokenAuthPaginationQueryOptionsTypeV2<BoardgameResponseData>;
}

/**
 * List/search boardgames. Swiftarr GETs are flex routes (optional auth), so this uses
 * `useOpenPaginationQuery`. `isFavorite` on each result is `false` for a logged-out request.
 * `favorite` filtering requires a token; callers must hide the UI that would request it
 * while logged out (see BoardgameListScreen's Favorites toggle).
 */
export const useBoardgamesQuery = ({search, favorite, options}: BoardgamesQueryOptions) => {
  return useOpenPaginationQuery<BoardgameResponseData>('/boardgames', options, {
    ...(favorite && {favorite: favorite}),
    ...(search && {search: search}),
  });
};

/**
 * Single boardgame. Flex auth.
 */
export const useBoardgameQuery = ({boardgameID}: BoardgameQueryOptions) => {
  return useOpenQuery<BoardgameData>(`/boardgames/${boardgameID}`);
};

/**
 * Expansions for a boardgame. Flex auth.
 */
export const useBoardgameExpansionsQuery = ({boardgameID, options}: BoardgameQueryOptions) => {
  return useOpenPaginationQuery<BoardgameResponseData>(`/boardgames/expansions/${boardgameID}`, options);
};

/**
 * Boardgame recommendation guide. Flex auth.
 */
export const useBoardgameRecommendQuery = ({options}: BoardgameRecommendQueryOptions) => {
  return useOpenPaginationQuery<BoardgameResponseData>('/boardgames/recommend', options);
};
