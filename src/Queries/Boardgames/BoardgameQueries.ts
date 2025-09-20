import {BoardgameData, BoardgameResponseData} from '#src/Structs/ControllerStructs';
import {useTokenAuthPaginationQuery, useTokenAuthQuery} from '#src/Queries/TokenAuthQuery';

interface BoardgamesQueryOptions {
  search?: string;
  favorite?: boolean;
  options?: {};
}

interface BoardgameQueryOptions {
  boardgameID: string;
  options?: {};
}

interface BoardgameRecommendQueryOptions {
  options?: {};
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
