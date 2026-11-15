import {useQuery} from '@tanstack/react-query';
import axios, {HttpStatusCode} from 'axios';

import {HealthcheckResult} from '#src/Components/Views/Settings/ServerHealthcheckResultView';
import {useConfig} from '#src/Context/Contexts/ConfigContext';
import {joinUrl} from '#src/Libraries/UrlParser';
import {HealthResponse} from '#src/Structs/ControllerStructs';

/**
 * Healthcheck of an explicit server, independent of the active session, for flows that choose a
 * server without switching to it (add account). The server answers /client/health with a body even
 * when it is unhappy, so any HTTP status is read rather than thrown. Never retried or cached: a
 * result is only ever for the server it was asked about.
 */
export const useExplicitServerHealth = (serverUrl: string | undefined): HealthcheckResult => {
  const {appConfig} = useConfig();
  const query = useQuery<HealthResponse>({
    queryKey: ['explicit-server-health', serverUrl],
    enabled: !!serverUrl,
    retry: false,
    gcTime: 0,
    staleTime: 0,
    queryFn: async () => {
      const response = await axios.get<HealthResponse>(
        joinUrl(joinUrl(serverUrl, appConfig.urlPrefix), '/client/health'),
        {
          timeout: appConfig.apiClientConfig.requestTimeout,
          validateStatus: () => true,
        },
      );
      return response.data;
    },
  });
  const checking = !!serverUrl && (query.isFetching || query.isPending);
  const passed = !checking && query.isSuccess && query.data?.status === HttpStatusCode.Ok && !query.data?.error;
  return {healthQuery: query, checking, passed};
};
