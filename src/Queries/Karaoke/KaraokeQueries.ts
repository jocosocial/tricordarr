import {useSwiftarrQueryClient} from '#src/Context/Contexts/SwiftarrQueryClientContext';
import {useOpenPaginationQuery, useOpenQuery} from '#src/Queries/OpenQuery';
import {PaginationQueryParams} from '#src/Queries/Pagination';
import {type TokenAuthPaginationQueryOptionsTypeV2} from '#src/Queries/TokenAuthQuery';
import {KaraokePerformedSongsResult, KaraokeSongData, KaraokeSongResponseData} from '#src/Structs/ControllerStructs';

/** Params for GET /api/v3/karaoke/latest. */
interface KaraokeLatestQueryParams extends PaginationQueryParams {
  search?: string;
}

/** Params for GET /api/v3/karaoke (search/favorites). */
interface KaraokeSongsQueryParams extends PaginationQueryParams {
  search?: string;
  favorite?: boolean;
}

/** Response shape with paginator for infinite query (search returns totalSongs/start/limit). */
interface KaraokeSongResponseWithPaginator extends KaraokeSongResponseData {
  paginator: {total: number; start: number; limit: number};
}

/**
 * GET /api/v3/karaoke/latest – recent performances. Swiftarr GETs are flex routes (optional
 * auth), so this uses `useOpenPaginationQuery`. `isFavorite` on each result is `false` for a
 * logged-out request.
 */
export const useKaraokeLatestQuery = (
  params: {search?: string; options?: TokenAuthPaginationQueryOptionsTypeV2<KaraokePerformedSongsResult>} = {},
) => {
  const {search, options} = params;
  return useOpenPaginationQuery<KaraokePerformedSongsResult, KaraokeLatestQueryParams>('/karaoke/latest', options, {
    ...(search && search.trim() && {search: search.trim()}),
  });
};

async function fetchKaraokeSongsPage(
  apiGet: ReturnType<typeof useSwiftarrQueryClient>['apiGet'],
  queryParams: KaraokeSongsQueryParams,
  pageParam: PaginationQueryParams,
): Promise<KaraokeSongResponseWithPaginator> {
  const {data} = await apiGet<KaraokeSongResponseData, KaraokeSongsQueryParams>('/karaoke', {
    ...queryParams,
    ...(pageParam?.start !== undefined && {start: pageParam.start}),
    ...(pageParam?.limit !== undefined && {limit: pageParam.limit}),
  });
  return {
    ...data,
    paginator: {total: data.totalSongs, start: data.start, limit: data.limit},
  };
}

/**
 * GET /api/v3/karaoke – search and favorites. Swiftarr GETs are flex routes (optional auth), so
 * this is disabled only by session hydration / connectivity, not login state. `isFavorite` on
 * each result is `false` for a logged-out request. `favorite` filtering requires a token;
 * callers must hide the UI that would request it while logged out (see
 * KaraokeFavoritesListScreen, which stays behind LoggedInScreen).
 * Only run when search (≥3 chars, or single letter, or #) or favorite === true.
 */
export const useKaraokeSongsQuery = (params: {
  search?: string;
  favorite?: boolean;
  options?: TokenAuthPaginationQueryOptionsTypeV2<KaraokeSongResponseWithPaginator>;
}) => {
  const {search, favorite, options} = params;
  const {apiGet} = useSwiftarrQueryClient();
  const trimmedSearch = search?.trim() ?? '';
  const searchAllowed = trimmedSearch.length >= 3 || trimmedSearch.length === 1 || trimmedSearch === '#';

  const queryParams: KaraokeSongsQueryParams = {
    ...(favorite && {favorite: true}),
    ...(trimmedSearch && {search: trimmedSearch}),
  };

  return useOpenPaginationQuery<KaraokeSongResponseWithPaginator, KaraokeSongsQueryParams>(
    '/karaoke',
    {
      ...options,
      enabled: options?.enabled !== false && (searchAllowed || favorite === true),
      queryFn: ctx => fetchKaraokeSongsPage(apiGet, queryParams, ctx.pageParam),
    },
    queryParams,
  );
};

/**
 * GET /api/v3/karaoke/:song_id – single song. Flex auth.
 */
export const useKaraokeSongQuery = (songID: string, options?: {enabled?: boolean}) => {
  return useOpenQuery<KaraokeSongData>(`/karaoke/${songID}`, {
    ...options,
    enabled: options?.enabled !== false && !!songID,
  });
};
