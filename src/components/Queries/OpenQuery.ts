import {AxiosError} from 'axios';
import {ErrorResponse} from '../../libraries/Structs/ControllerStructs';
import {QueryKey, useQuery} from '@tanstack/react-query';
import {UseQueryOptions, UseQueryResult} from '@tanstack/react-query';
import {useSwiftarrQueryClient} from '../Context/Contexts/SwiftarrQueryClientContext';

/**
 * Clone of useQuery but dedicated for queries that can be performed without the user needing
 * to be logged in. Also does our error processing.
 */
export function useOpenQuery<
  TData,
  TQueryKey extends QueryKey = QueryKey,
  TQueryParams = Object,
  TError extends Error = AxiosError<ErrorResponse>,
>(
  endpoint: string,
  // Reminder: onError is deprecated. It's in SwiftarrQueryClientProvider.tsx instead.
  options?: Omit<UseQueryOptions<TData, TError, TData>, 'initialData' | 'queryKey'> & {
    initialData?: () => undefined;
  },
  queryParams?: TQueryParams,
  queryKey?: TQueryKey,
): UseQueryResult<TData, TError> {
  const {disruptionDetected, apiGet} = useSwiftarrQueryClient();

  return useQuery<TData, TError, TData>({
    enabled: !disruptionDetected,
    queryKey: queryKey ? queryKey : [endpoint, queryParams],
    queryFn: options?.queryFn
      ? options.queryFn
      : async () => {
          const response = await apiGet<TData, TQueryParams>({url: endpoint, queryParams: queryParams});
          return response.data;
        },
    ...options,
  });
}
