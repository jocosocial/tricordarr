import {
  type GetNextPageParamFunction,
  InfiniteData,
  QueryKey,
  useInfiniteQuery,
  UseInfiniteQueryOptions,
  UseInfiniteQueryResult,
  useQuery,
  UseQueryOptions,
  UseQueryResult,
} from '@tanstack/react-query';
import {AxiosError} from 'axios';

import {useConfig} from '#src/Context/Contexts/ConfigContext';
import {useSession} from '#src/Context/Contexts/SessionContext';
import {useSwiftarrQueryClient} from '#src/Context/Contexts/SwiftarrQueryClientContext';
import {shouldQueryEnable} from '#src/Libraries/Network/APIClient';
import {
  getNextPageParam,
  getPreviousPageParam,
  // PageParam,
  PaginationQueryParams,
  WithPaginator,
} from '#src/Queries/Pagination';
import {ErrorResponse, FezData} from '#src/Structs/ControllerStructs';

export type TokenAuthQueryOptionsType<TData, TError extends Error = AxiosError<ErrorResponse>> = Omit<
  UseQueryOptions<TData, TError, TData>,
  'initialData' | 'queryKey' | 'onError' | 'enabled'
> & {
  // React Query v5 allows for enabled to be a function. We are disabling that
  // for now to maintain simplicity in the query wrappers.
  enabled?: boolean;
};

/**
 * Clone of useQuery but coded to require the user be logged in.
 * Some endpoints can be used without authentication such as the schedule.
 */
export function useTokenAuthQuery<TData, TQueryParams = Object, TError extends Error = AxiosError<ErrorResponse>>(
  endpoint: string,
  // Reminder: onError is deprecated. It's in SwiftarrQueryClientProvider.tsx instead.
  options?: TokenAuthQueryOptionsType<TData, TError>,
  queryParams?: TQueryParams,
): UseQueryResult<TData, TError> {
  const {isLoggedIn} = useSession();
  const {disruptionDetected, apiGet, queryKeyExtraData} = useSwiftarrQueryClient();

  return useQuery<TData, TError, TData>({
    queryKey: [endpoint, queryParams, ...queryKeyExtraData],
    ...options,
    queryFn: options?.queryFn
      ? options.queryFn
      : async () => {
          const response = await apiGet<TData, TQueryParams>(endpoint, queryParams);
          return response.data;
        },
    enabled: shouldQueryEnable(isLoggedIn, disruptionDetected, options?.enabled),
  });
}

/**
 * I don't know if my overrides of the TQueryFnData with TData are a good thing or not.
 * Though maybe because I'm not returning the entire query response object (TQueryFnData)
 * then maybe it's OK? This is some meta voodoo.
 * @param endpoint
 * @param options
 * @param queryParams
 */
// export function useTokenAuthPaginationQuery<
//   TQueryFnData extends WithPaginator | FezData,
//   TData = TQueryFnData,
//   TError extends Error = AxiosError<ErrorResponse>,
//   TQueryParams extends PaginationQueryParams = PaginationQueryParams,
// >(
//   endpoint: string,
//   options?: TokenAuthPaginationQueryOptionsType<TData, PaginationQueryParams, TError>,
//   queryParams?: TQueryParams,
// ) {
//   const {isLoggedIn} = useSession();
//   const {disruptionDetected, apiGet, queryKeyExtraData} = useSwiftarrQueryClient();
//   const {appConfig} = useConfig();

//   const defaultQueryFn = async ({pageParam}: {pageParam: PaginationQueryParams}) => {
//     const {data: responseData} = await apiGet<TData, PaginationQueryParams>(endpoint, {
//       ...(pageParam.limit !== undefined ? {limit: pageParam.limit} : undefined),
//       ...(pageParam.start !== undefined ? {start: pageParam.start} : undefined),
//       ...queryParams,
//     });
//     return responseData;
//   };

//   return useInfiniteQuery({
//     queryKey: [endpoint, queryParams, ...queryKeyExtraData],
//     // queryFn: options?.queryFn || defaultQueryFn,
//     // queryFn: defaultQueryFn,
//     // queryFn: testFunction,
//     queryFn: defaultQueryFn,
//     initialPageParam: {start: undefined, limit: appConfig.apiClientConfig.defaultPageSize},
//     getNextPageParam: (lastPage: TData) => getNextPageParam(lastPage),
//     getPreviousPageParam: (firstPage: TData) => getPreviousPageParam(firstPage),
//     ...options,
//     enabled: shouldQueryEnable(isLoggedIn, disruptionDetected, options?.enabled),
//   });
// }

// export function useTokenAuthPaginationQueryV2<
//   TData extends WithPaginator | FezData,
//   TError extends Error = AxiosError<ErrorResponse>,
//   TQueryParams extends PaginationQueryParams = PaginationQueryParams,
// >(
//   endpoint: string,
//   options?: TokenAuthPaginationQueryOptionsType<TData, PaginationQueryParams, TError>,
//   queryParams?: TQueryParams,
// ) {
//   const {isLoggedIn} = useSession();
//   const {disruptionDetected, apiGet, queryKeyExtraData} = useSwiftarrQueryClient();

//   // const defaultQueryFn = async ({pageParam}: {pageParam: PaginationQueryParams}) => {
//   //   const {data: responseData} = await apiGet<TData, PaginationQueryParams>(endpoint, {
//   //     ...(pageParam.limit !== undefined ? {limit: pageParam.limit} : undefined),
//   //     ...(pageParam.start !== undefined ? {start: pageParam.start} : undefined),
//   //     ...queryParams,
//   //   });
//   //   return responseData;
//   // };

//   // const queryFn = async ({pageParam}: {pageParam: object}) => {
//   //   return {} as TData;
//   // };

//   return useInfiniteQuery<TData, TError, InfiniteData<TData>>({
//     queryKey: [endpoint, queryParams, ...queryKeyExtraData],
//     queryFn: queryFn,
//     // initialPageParam: {start: undefined, limit: 50},
//     // getNextPageParam: (lastPage: TData) => getNextPageParam(lastPage),
//     // getPreviousPageParam: (firstPage: TData) => getPreviousPageParam(firstPage),
//     // ...options,
//     // enabled: shouldQueryEnable(isLoggedIn, disruptionDetected, options?.enabled),
//   });
// }

export type TokenAuthPaginationQueryOptionsType<
  TData,
  TPageParam = PaginationQueryParams,
  TError extends Error = AxiosError<ErrorResponse>,
> = Omit<
  UseInfiniteQueryOptions<TData, TError, InfiniteData<TData, TPageParam>>,
  'initialData' | 'queryKey' | 'onError' | 'enabled'
> & {
  // React Query v5 allows for enabled to be a function. We are disabling that
  // for now to maintain simplicity in the query wrappers.
  enabled?: boolean;
};

export type TokenAuthPaginationQueryOptionsTypeV2<
  TQueryFnData,
  TError extends Error = AxiosError<ErrorResponse>,
  TData = InfiniteData<TQueryFnData, PaginationQueryParams>,
  TQueryKey extends QueryKey = QueryKey,
> = Omit<
  UseInfiniteQueryOptions<TQueryFnData, TError, TData, TQueryKey, PaginationQueryParams>,
  'initialData' | 'queryKey' | 'onError' | 'enabled' | 'getNextPageParam' | 'initialPageParam'
> & {
  /**
   * Your query function gets a `pageParam` object containing { start?, limit? }.
   */
  // queryFn?: (ctx: {
  //   pageParam: PaginationQueryParams;
  //   queryKey: TQueryKey;
  //   signal?: AbortSignal;
  //   meta?: any;
  // }) => Promise<TQueryFnData>;
  // React Query v5 allows for enabled to be a function. We are disabling that
  // for now to maintain simplicity in the query wrappers.
  enabled?: boolean;
  getNextPageParam?: GetNextPageParamFunction<PaginationQueryParams, TQueryFnData>;
  initialPageParam?: PaginationQueryParams;
};

/**
 * Wrapper around useInfiniteQuery with a default query function signature.
 */
export function useTokenAuthPaginationQuery<
  // The raw API data.
  TQueryFnData extends WithPaginator | FezData,
  // Query and pagination parameters.
  TQueryParams = PaginationQueryParams & Record<string, unknown>,
  // Data that this function returns, optionally transformed data.
  TData = InfiniteData<TQueryFnData, PaginationQueryParams>,
  // Error
  TError extends Error = AxiosError<ErrorResponse>,
>(
  endpoint: string,
  options?: TokenAuthPaginationQueryOptionsTypeV2<TQueryFnData, TError, TData>,
  queryParams?: TQueryParams,
): UseInfiniteQueryResult<TData, TError> {
  const {isLoggedIn} = useSession();
  const {disruptionDetected, apiGet, queryKeyExtraData} = useSwiftarrQueryClient();
  const {appConfig} = useConfig();

  const defaultQueryFn = async ({pageParam}: {pageParam: PaginationQueryParams}) => {
    const {data: responseData} = await apiGet<TQueryFnData, TQueryParams>(endpoint, {
      ...(pageParam?.limit !== undefined ? {limit: pageParam.limit} : undefined),
      ...(pageParam?.start !== undefined ? {start: pageParam.start} : undefined),
      ...queryParams,
    } as TQueryParams);
    return responseData;
  };

  return useInfiniteQuery({
    ...options,
    queryKey: [endpoint, queryParams, ...queryKeyExtraData],
    queryFn: options?.queryFn || defaultQueryFn,
    initialPageParam: {start: undefined, limit: appConfig.apiClientConfig.defaultPageSize},
    getNextPageParam: (lastPage: TQueryFnData) => getNextPageParam(lastPage),
    getPreviousPageParam: (firstPage: TQueryFnData) => getPreviousPageParam(firstPage),
    enabled: shouldQueryEnable(isLoggedIn, disruptionDetected, options?.enabled),
  });
}
