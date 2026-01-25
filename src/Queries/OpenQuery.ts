import {useQuery, UseQueryOptions, UseQueryResult} from '@tanstack/react-query';
import {AxiosError} from 'axios';

import {useSwiftarrQueryClient} from '#src/Context/Contexts/SwiftarrQueryClientContext';
import {ErrorResponse} from '#src/Structs/ControllerStructs';

/**
 * Clone of useQuery but dedicated for queries that can be performed without the user needing
 * to be logged in. Also does our error processing.
 */
export function useOpenQuery<TData, TQueryParams = Object, TError extends Error = AxiosError<ErrorResponse>>(
  endpoint: string,
  // Reminder: onError is deprecated. It's in SwiftarrQueryClientProvider.tsx instead.
  options?: Omit<UseQueryOptions<TData, TError, TData>, 'initialData' | 'queryKey'> & {
    initialData?: () => undefined;
  },
  queryParams?: TQueryParams,
): UseQueryResult<TData, TError> {
  const {disruptionDetected, apiGet, queryKeyExtraData} = useSwiftarrQueryClient();
  const enabled = !disruptionDetected;
  const queryKey = [endpoint, queryParams, ...queryKeyExtraData];

  const result = useQuery<TData, TError, TData>({
    enabled,
    queryKey,
    queryFn: options?.queryFn
      ? options.queryFn
      : async () => {
          const response = await apiGet<TData, TQueryParams>(endpoint, queryParams);
          return response.data;
        },
    ...options,
  });
  return result;
}

export function usePublicQuery<TData, TQueryParams = Object, TError extends Error = AxiosError<ErrorResponse>>(
  endpoint: string,
  // Reminder: onError is deprecated. It's in SwiftarrQueryClientProvider.tsx instead.
  options?: Omit<UseQueryOptions<TData, TError, TData>, 'initialData' | 'queryKey'> & {
    initialData?: () => undefined;
  },
  queryParams?: TQueryParams,
): UseQueryResult<TData, TError> {
  const {disruptionDetected, publicGet, queryKeyExtraData} = useSwiftarrQueryClient();
  const enabled = !disruptionDetected;
  const queryKey = [endpoint, queryParams, ...queryKeyExtraData];

  const result = useQuery<TData, TError, TData>({
    enabled,
    queryKey,
    queryFn: options?.queryFn
      ? options.queryFn
      : async () => {
          const response = await publicGet<TData, TQueryParams>(endpoint, queryParams);
          return response.data;
        },
    ...options,
  });
  return result;
}
