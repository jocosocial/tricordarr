import {useQueryClient} from '@tanstack/react-query';
import {isAxiosError} from 'axios';

import {useSwiftarrQueryClient} from '#src/Context/Contexts/SwiftarrQueryClientContext';
import {useOpenQuery, usePublicQuery} from '#src/Queries/OpenQuery';
import {ClientSettingsData, HealthResponse, SwiftarrClientConfig} from '#src/Structs/ControllerStructs';

export const useHealthQuery = (options = {}) => {
  const client = useQueryClient();
  const {apiGet, queryKeyExtraData} = useSwiftarrQueryClient();
  const queryKey = ['/client/health', undefined, ...queryKeyExtraData];

  return useOpenQuery<HealthResponse>('/client/health', {
    retry: false,
    gcTime: 0,
    staleTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: 'always',
    refetchOnReconnect: 'always',
    queryFn: async (): Promise<HealthResponse> => {
      try {
        const response = await apiGet<HealthResponse, undefined>('/client/health');
        return response.data;
      } catch (error) {
        // Axios gets "helpful" and throws an exception with a 500 error response. But the healthcheck
        // endpoint returns something if thats the case. This forces the response data to be set if we got
        // a valid healthcheck response back. It also wipes out any past data on fail because apparently
        // the keepPreviousData and cacheTime above aren't enough.
        if (isAxiosError(error) && error.response?.data) {
          const responseData = error.response.data as HealthResponse;
          if (!responseData.error) {
            // Set query data to null to wipe out past data
            client.setQueryData(queryKey, null);
            // Return the response data anyway (query will succeed with this data)
            return responseData;
          } else {
            // Set query data explicitly and return it
            client.setQueryData(queryKey, responseData);
            return responseData;
          }
        }
        throw error;
      }
    },
    ...options,
  });
};

/**
 * This has been reduced to just Tricordarr-specific data. aka latest version.
 */
export const useClientConfigQuery = (options = {}) => {
  return usePublicQuery<SwiftarrClientConfig>('/public/clients/tricordarr.json', {
    ...options,
  });
};

/**
 * Cruise settings data. Replaces the .env files.
 */
export const useClientSettingsQuery = (options = {}) => {
  return useOpenQuery<ClientSettingsData>('/client/settings', {
    ...options,
  });
};
