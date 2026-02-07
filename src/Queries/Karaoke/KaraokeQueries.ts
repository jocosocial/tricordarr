import {type QueryFunctionContext, useInfiniteQuery} from '@tanstack/react-query';

import {useConfig} from '#src/Context/Contexts/ConfigContext';
import {useSession} from '#src/Context/Contexts/SessionContext';
import {useSwiftarrQueryClient} from '#src/Context/Contexts/SwiftarrQueryClientContext';
import {shouldQueryEnable} from '#src/Libraries/Network/APIClient';
import {getNextPageParam, getPreviousPageParam, PaginationQueryParams} from '#src/Queries/Pagination';
import {
  type TokenAuthPaginationQueryOptionsTypeV2,
  useTokenAuthPaginationQuery,
  useTokenAuthQuery,
} from '#src/Queries/TokenAuthQuery';
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
 * GET /api/v3/karaoke/latest – recent performances.
 * Use when logged in; endpoint is flex auth.
 */
export const useKaraokeLatestQuery = (
  params: {search?: string; options?: TokenAuthPaginationQueryOptionsTypeV2<KaraokePerformedSongsResult>} = {},
) => {
  const {search, options} = params;
  return useTokenAuthPaginationQuery<KaraokePerformedSongsResult, KaraokeLatestQueryParams>(
    '/karaoke/latest',
    options,
    {...(search && search.trim() && {search: search.trim()})},
  );
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
 * GET /api/v3/karaoke – search and favorites.
 * Only run when search (≥3 chars, or single letter, or #) or favorite === true.
 */
export const useKaraokeSongsQuery = (params: {
  search?: string;
  favorite?: boolean;
  options?: TokenAuthPaginationQueryOptionsTypeV2<KaraokeSongResponseWithPaginator>;
}) => {
  const {search, favorite, options} = params;
  const trimmedSearch = search?.trim() ?? '';
  const searchAllowed = trimmedSearch.length >= 3 || trimmedSearch.length === 1 || trimmedSearch === '#';
  const enabled = options?.enabled !== false && (searchAllowed || favorite === true);

  const {isLoggedIn} = useSession();
  const {disruptionDetected, apiGet, queryKeyExtraData} = useSwiftarrQueryClient();
  const {appConfig} = useConfig();

  const queryParams: KaraokeSongsQueryParams = {
    ...(favorite && {favorite: true}),
    ...(trimmedSearch && {search: trimmedSearch}),
  };

  return useInfiniteQuery({
    ...options,
    queryKey: ['/karaoke', queryParams, ...queryKeyExtraData],
    queryFn: (ctx: QueryFunctionContext) =>
      fetchKaraokeSongsPage(apiGet, queryParams, ctx.pageParam as PaginationQueryParams),
    initialPageParam: {start: undefined, limit: appConfig.apiClientConfig.defaultPageSize} as PaginationQueryParams,
    getNextPageParam: (lastPage: KaraokeSongResponseWithPaginator) => getNextPageParam(lastPage),
    getPreviousPageParam: (firstPage: KaraokeSongResponseWithPaginator) => getPreviousPageParam(firstPage),
    enabled: shouldQueryEnable(isLoggedIn, disruptionDetected, enabled),
  });
};

/**
 * GET /api/v3/karaoke/:song_id – single song.
 * Flex auth.
 */
export const useKaraokeSongQuery = (songID: string, options?: {enabled?: boolean}) => {
  return useTokenAuthQuery<KaraokeSongData>(`/karaoke/${songID}`, {
    ...options,
    enabled: options?.enabled !== false && !!songID,
  });
};
