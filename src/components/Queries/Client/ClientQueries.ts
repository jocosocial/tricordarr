import {useQueryClient} from '@tanstack/react-query';
import {HealthResponse, SwiftarrClientConfig} from '../../../libraries/Structs/ControllerStructs';
import {useOpenQuery, usePublicQuery} from '../OpenQuery.ts';

export const useHealthQuery = (options = {}) => {
  const client = useQueryClient();
  return useOpenQuery<HealthResponse>('/client/health', {
    retry: false,
    keepPreviousData: false,
    cacheTime: 0,
    staleTime: 0,
    onError: response => {
      // Axios gets "helpful" and throws an exception with a 500 error response. But the healthcheck
      // endpoint returns something if thats the case. This forces the response data to be set if we got
      // a valid healthcheck response back. It also wipes out any past data on fail because apparently
      // the keepPreviousData and cacheTime above aren't enough.
      if (!response.response?.data.error) {
        client.setQueryData(['/client/health'], () => null);
      } else {
        client.setQueryData(['/client/health'], () => response.response?.data);
      }
    },
    ...options,
  });
};

export const useClientConfigQuery = (options = {}) => {
  return usePublicQuery<SwiftarrClientConfig>('/public/clients/tricordarr.json', {
    ...options,
  });
};
