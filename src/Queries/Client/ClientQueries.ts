import {useQueryClient} from '@tanstack/react-query';
import {HttpStatusCode, isAxiosError} from 'axios';

import {useSwiftarrQueryClient} from '#src/Context/Contexts/SwiftarrQueryClientContext';
import {STALE} from '#src/Libraries/Time/Time';
import {useExplicitOpenQuery, useOpenQuery, usePublicQuery} from '#src/Queries/OpenQuery';
import {ClientSettingsData, HealthResponse} from '#src/Structs/ControllerStructs';

/**
 * The body of a failed /client/health request. Axios throws on a 500, but the healthcheck endpoint
 * still answers with a HealthResponse then, so that body is recovered; anything else is rethrown.
 */
const recoverHealthResponse = (error: unknown): HealthResponse => {
  if (isAxiosError(error) && error.response?.data) {
    return error.response.data as HealthResponse;
  }
  throw error;
};

/**
 * Whether a healthcheck response says the server is healthy.
 */
export const isHealthyResponse = (data: HealthResponse | null | undefined) =>
  data?.status === HttpStatusCode.Ok && !data.error;

/**
 * Healthcheck of the active session's server.
 */
export const useHealthQuery = (options = {}) => {
  const client = useQueryClient();
  const {apiGet, queryKeyExtraData} = useSwiftarrQueryClient();
  const queryKey = ['/client/health', undefined, ...queryKeyExtraData];

  return useOpenQuery<HealthResponse>('/client/health', {
    retry: false,
    gcTime: 0,
    staleTime: 0,
    // A failed healthcheck (timeout, 404, etc.) must not re-run on its own. Only an explicit
    // refetch() may retry it; the automatic triggers below apply to non-error state only.
    retryOnMount: false,
    refetchOnMount: query => (query.state.status === 'error' ? false : 'always'),
    refetchOnWindowFocus: query => (query.state.status === 'error' ? false : 'always'),
    refetchOnReconnect: query => (query.state.status === 'error' ? false : 'always'),
    queryFn: async (): Promise<HealthResponse> => {
      try {
        const response = await apiGet<HealthResponse, undefined>('/client/health');
        return response.data;
      } catch (error) {
        // Axios gets "helpful" and throws an exception with a 500 error response. But the healthcheck
        // endpoint returns something if thats the case. This forces the response data to be set if we got
        // a valid healthcheck response back. It also wipes out any past data on fail because apparently
        // the keepPreviousData and cacheTime above aren't enough.
        const responseData = recoverHealthResponse(error);
        // Without an error, set query data to null to wipe out past data; otherwise set it explicitly.
        // Either way the response data is returned (query will succeed with this data).
        client.setQueryData(queryKey, responseData.error ? responseData : null);
        return responseData;
      }
    },
    ...options,
  });
};

/**
 * Healthcheck of an explicit server, independent of the active session, for flows that choose a
 * server without switching to it. Never retried or cached: a result is only ever for the server it
 * was asked about.
 */
export const useExplicitServerHealthQuery = (serverUrl: string | undefined) => {
  return useExplicitOpenQuery<HealthResponse>(
    serverUrl,
    '/client/health',
    {retry: false, staleTime: 0},
    recoverHealthResponse,
  );
};

/**
 * This has been reduced to just Tricordarr-specific data. aka latest version.
 */
export const useClientConfigQuery = (options = {}) => {
  return usePublicQuery<unknown>('/public/clients/tricordarr.json', {
    ...options,
  });
};

/**
 * Cruise settings data. Replaces the .env files.
 */
export const useClientSettingsQuery = (options = {}) => {
  return useOpenQuery<ClientSettingsData>('/client/settings', {
    staleTime: STALE.HOURS.TWENTY_FOUR,
    ...options,
  });
};
