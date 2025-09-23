import {TokenAuthPaginationQueryOptionsTypeV2, useTokenAuthPaginationQuery, useTokenAuthQuery} from '#src/Queries/TokenAuthQuery';
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

export const useBoardgamesQuery = ({search, favorite, options}: BoardgamesQueryOptions) => {
  return useTokenAuthPaginationQuery<BoardgameResponseData>('/boardgames', options, {
    ...(favorite && {favorite: favorite}),
    ...(search && {search: search}),
  });
};

export const useBoardgameQuery = ({boardgameID}: BoardgameQueryOptions) => {
  return useTokenAuthQuery<BoardgameData>(`/boardgames/${boardgameID}`);
};

export const useBoardgameExpansionsQuery = ({boardgameID, options}: BoardgameQueryOptions) => {
  return useTokenAuthPaginationQuery<BoardgameResponseData>(`/boardgames/expansions/${boardgameID}`, options);
};

export const useBoardgameRecommendQuery = ({options}: BoardgameRecommendQueryOptions) => {
  return useTokenAuthPaginationQuery<BoardgameResponseData>('/boardgames/recommend', options);
};
