import {UseQueryResult} from '@tanstack/react-query';

import {isHealthyResponse, useExplicitServerHealthQuery, useHealthQuery} from '#src/Queries/Client/ClientQueries';
import {HealthResponse} from '#src/Structs/ControllerStructs';

/**
 * Derives the result of a healthcheck from its query. While a check is running (including a
 * same-key refetch) the previous result is not current, so `checking` is true and `passed` is false.
 */
const toHealthcheckResult = <TError>(healthQuery: UseQueryResult<HealthResponse, TError>, enabled: boolean) => {
  const {data, isFetching, isPending, isSuccess} = healthQuery;
  // isPending covers a freshly re-keyed query (e.g. a server switch) that has no result yet. A
  // disabled query is pending forever, so it only counts once there is something to check.
  const checking = enabled && (isFetching || isPending);
  // isSuccess, not just data: a refetch that errors keeps the previous (passing) data around.
  const passed = !checking && isSuccess && isHealthyResponse(data);
  return {healthQuery, checking, passed};
};

/**
 * Derived state of the server healthcheck, read straight from the health query so every consumer
 * agrees on it in the same render.
 */
export const useServerHealthStatus = () => {
  return toHealthcheckResult(useHealthQuery(), true);
};

/**
 * Derived state of the healthcheck of an explicit server, independent of the active session, for
 * flows that choose a server without switching to it.
 */
export const useExplicitServerHealthStatus = (serverUrl: string | undefined) => {
  return toHealthcheckResult(useExplicitServerHealthQuery(serverUrl), !!serverUrl);
};
