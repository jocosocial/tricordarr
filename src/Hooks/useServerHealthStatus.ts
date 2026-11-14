import {HttpStatusCode} from 'axios';

import {useHealthQuery} from '#src/Queries/Client/ClientQueries';

/**
 * Derived state of the server healthcheck, read straight from the health query so every consumer
 * agrees on it in the same render. While a check is running (including a same-key refetch) the
 * previous result is not current, so `checking` is true and `passed` is false.
 */
export const useServerHealthStatus = () => {
  const healthQuery = useHealthQuery();
  const {data, isFetching, isPending, isSuccess} = healthQuery;
  // isPending covers a freshly re-keyed query (e.g. a server switch) that has no result yet.
  const checking = isFetching || isPending;
  // isSuccess, not just data: a refetch that errors keeps the previous (passing) data around.
  const passed = !checking && isSuccess && data?.status === HttpStatusCode.Ok;
  return {healthQuery, checking, passed};
};
