import {useQuery, UseQueryOptions, UseQueryResult} from '@tanstack/react-query';
import {AxiosError} from 'axios';

import {useSession} from '#src/Context/Contexts/SessionContext';
import {useSwiftarrQueryClient} from '#src/Context/Contexts/SwiftarrQueryClientContext';
import {ErrorResponse} from '#src/Structs/ControllerStructs';

/**
 * Clone of useQuery for endpoints that do not require a logged-in user.
 * Disabled while Session is hydrating so the request uses the session server URL
 * (or the first-launch AppConfig default) rather than a stale fallback.
 */
export function useOpenQuery<TData, TQueryParams = Object, TError extends Error = AxiosError<ErrorResponse>>(
  endpoint: string,
  // Reminder: onError is deprecated. It's in SwiftarrQueryClientProvider.tsx instead.
  options?: Omit<UseQueryOptions<TData, TError, TData>, 'initialData' | 'queryKey'> & {
    initialData?: () => undefined;
  },
  queryParams?: TQueryParams,
): UseQueryResult<TData, TError> {
  const {isLoading} = useSession();
  const {disruptionDetected, apiGet, queryKeyExtraData} = useSwiftarrQueryClient();
  const queryKey = [endpoint, queryParams, ...queryKeyExtraData];
  const enabled = !isLoading && !disruptionDetected && (options?.enabled ?? true);

  const result = useQuery<TData, TError, TData>({
    queryKey,
    ...options,
    queryFn: options?.queryFn
      ? options.queryFn
      : async () => {
          const response = await apiGet<TData, TQueryParams>(endpoint, queryParams);
          return response.data;
        },
    enabled,
  });
  return result;
}

/**
 * Clone of useQuery for unauthenticated public (non-API-prefix) endpoints.
 * Disabled while Session is hydrating so the request uses the session server URL
 * (or the first-launch AppConfig default) rather than a stale fallback.
 */
export function usePublicQuery<TData, TQueryParams = Object, TError extends Error = AxiosError<ErrorResponse>>(
  endpoint: string,
  // Reminder: onError is deprecated. It's in SwiftarrQueryClientProvider.tsx instead.
  options?: Omit<UseQueryOptions<TData, TError, TData>, 'initialData' | 'queryKey'> & {
    initialData?: () => undefined;
  },
  queryParams?: TQueryParams,
): UseQueryResult<TData, TError> {
  const {isLoading} = useSession();
  const {disruptionDetected, publicGet, queryKeyExtraData} = useSwiftarrQueryClient();
  const queryKey = [endpoint, queryParams, ...queryKeyExtraData];
  const enabled = !isLoading && !disruptionDetected && (options?.enabled ?? true);

  const result = useQuery<TData, TError, TData>({
    queryKey,
    ...options,
    queryFn: options?.queryFn
      ? options.queryFn
      : async () => {
          const response = await publicGet<TData, TQueryParams>(endpoint, queryParams);
          return response.data;
        },
    enabled,
  });
  return result;
}
