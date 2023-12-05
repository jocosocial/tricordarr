import axios, {AxiosError, AxiosResponse} from 'axios';
import {useInfiniteQuery, useMutation} from '@tanstack/react-query';
import {ErrorResponse, FezContentData, FezData, FezListData} from '../../../libraries/Structs/ControllerStructs';
import {useErrorHandler} from '../../Context/Contexts/ErrorHandlerContext';
import {PrivilegedUserAccounts} from '../../../libraries/Enums/UserAccessLevel';
import {FezType} from '../../../libraries/Enums/FezType';
import {getNextPageParam, getPreviousPageParam, PaginationParams} from '../Pagination';
import {useTokenAuthInfiniteQuery} from '../TokenAuthQuery';

// https://medium.com/@deshan.m/reusable-react-query-hooks-with-typescript-simplifying-api-calls-f2583b24c82a

interface FezCreateMutationProps {
  fezContentData: FezContentData;
}

const fezCreateQueryHandler = async ({fezContentData}: FezCreateMutationProps): Promise<AxiosResponse<FezData>> => {
  return await axios.post('/fez/create', fezContentData);
};

export const useFezCreateMutation = (retry = 0) => {
  const {setErrorMessage} = useErrorHandler();
  return useMutation<AxiosResponse<FezData>, AxiosError<ErrorResponse>, FezCreateMutationProps>(fezCreateQueryHandler, {
    retry: retry,
    onError: error => {
      setErrorMessage(error.response?.data.reason);
    },
  });
};

interface FezUpdateMutationProps extends FezCreateMutationProps {
  fezID: string;
}

const fezUpdateQueryHandler = async ({
  fezID,
  fezContentData,
}: FezUpdateMutationProps): Promise<AxiosResponse<FezData>> => {
  return await axios.post(`/fez/${fezID}/update`, fezContentData);
};

export const useFezUpdateMutation = (retry = 0) => {
  const {setErrorMessage} = useErrorHandler();
  return useMutation<AxiosResponse<FezData>, AxiosError<ErrorResponse>, FezUpdateMutationProps>(fezUpdateQueryHandler, {
    retry: retry,
    onError: error => {
      setErrorMessage(error.response?.data.reason);
    },
  });
};

interface SeamailQueryProps {
  pageSize?: number;
  fezID: string;
}

interface SeamailListQueryOptions {
  pageSize?: number;
  forUser?: keyof typeof PrivilegedUserAccounts;
  search?: string;
  options?: {};
}

export const useSeamailListQuery = (
  {pageSize, forUser, search, options = {}}: SeamailListQueryOptions = {pageSize: 50},
) => {
  const {setErrorMessage} = useErrorHandler();
  return useTokenAuthInfiniteQuery<FezListData, AxiosError<ErrorResponse>>(
    ['/fez/joined', {type: ['closed', 'open'], search: search}],
    async ({pageParam = {limit: pageSize}}) => {
      const {start, limit} = pageParam as PaginationParams;
      const queryParams = {
        ...(start !== undefined && {start: start}),
        ...(limit !== undefined && {limit: limit}),
        ...(search && {search: search}),
        // Heads up, Swiftarr is case-sensitive with query params. forUser != foruser.
        ...(forUser !== undefined && {foruser: forUser.toLowerCase()}),
        type: [FezType.closed, FezType.open],
      };
      const {data: responseData} = await axios.get<FezListData>('/fez/joined', {
        params: queryParams,
      });
      return responseData;
    },
    {
      getNextPageParam: lastPage => getNextPageParam(lastPage.paginator),
      getPreviousPageParam: lastPage => getPreviousPageParam(lastPage.paginator),
      onError: error => {
        setErrorMessage(error?.response?.data.reason);
      },
      ...options,
    },
  );
};

export const useSeamailQuery = ({pageSize = 50, fezID}: SeamailQueryProps) => {
  return useInfiniteQuery<FezData, Error>(
    // @TODO the key needs start too
    [`/fez/${fezID}?limit=${pageSize}`],
    async ({pageParam = {start: undefined, limit: pageSize}}) => {
      const {data: responseData} = await axios.get<FezData>(`/fez/${fezID}`, {
        params: {
          ...(pageParam.limit ? {limit: pageParam.limit} : undefined),
          ...(pageParam.start ? {start: pageParam.start} : undefined),
        },
      });
      return responseData;
    },
    {
      getNextPageParam: lastPage => {
        // no members can mean that this is an LFG you haven't joined.
        if (lastPage.members) {
          const {limit, start, total} = lastPage.members.paginator;
          const nextStart = start + limit;
          return nextStart < total ? {start: nextStart, limit} : undefined;
        }
      },
      getPreviousPageParam: firstPage => {
        // no members can mean that this is an LFG you haven't joined.
        if (firstPage.members) {
          const {limit, start} = firstPage.members.paginator;
          const prevStart = start - limit;
          return prevStart >= 0 ? {start: prevStart, limit} : undefined;
        }
      },
    },
  );
};

interface LfgListQueryOptions {
  cruiseDay?: number;
  fezType?: keyof typeof FezType;
  // start?: number;
  // limit?: number;
  pageSize?: number;
  hidePast?: boolean;
  endpoint?: 'open' | 'joined' | 'owner';
  excludeFezType?: FezType[];
  options?: {};
}

export const useLfgListQuery = ({
  cruiseDay,
  fezType,
  excludeFezType,
  hidePast = false,
  pageSize = 50,
  endpoint = 'open',
  options = {},
}: LfgListQueryOptions) => {
  const {setErrorMessage} = useErrorHandler();
  return useTokenAuthInfiniteQuery<FezListData, AxiosError<ErrorResponse>>(
    [`/fez/${endpoint}`, {cruiseDay, fezType, hidePast, pageSize, excludeFezType}],
    async ({pageParam = {limit: pageSize}}) => {
      const {start, limit} = pageParam as PaginationParams;
      const queryParams = {
        // Heads up, Swiftarr is case-sensitive with query params. forUser != foruser.
        // The !== undefined is necessary because 0 is false-y.
        ...(cruiseDay !== undefined && {cruiseday: cruiseDay}),
        ...(fezType !== undefined && {type: fezType}),
        ...(start !== undefined && {start: start}),
        ...(limit !== undefined && {limit: limit}),
        ...(hidePast !== undefined && {hidePast: hidePast}),
        ...(excludeFezType && {excludetype: excludeFezType}),
      };
      const {data: responseData} = await axios.get<FezListData>(`/fez/${endpoint}`, {
        params: queryParams,
      });
      return responseData;
    },
    {
      getNextPageParam: lastPage => getNextPageParam(lastPage.paginator),
      getPreviousPageParam: lastPage => getPreviousPageParam(lastPage.paginator),
      onError: error => {
        setErrorMessage(error?.response?.data.reason);
      },
      ...options,
    },
  );
};

interface FezCancelMutationProps {
  fezID: string;
}

const cancelQueryHandler = async ({fezID}: FezCancelMutationProps): Promise<AxiosResponse<FezData>> => {
  return await axios.post(`/fez/${fezID}/cancel`);
};

export const useFezCancelMutation = (retry = 0) => {
  const {setErrorMessage} = useErrorHandler();
  return useMutation<AxiosResponse<FezData>, AxiosError<ErrorResponse>, FezCancelMutationProps>(cancelQueryHandler, {
    retry: retry,
    onError: error => {
      setErrorMessage(error.response?.data.reason || error.message);
    },
  });
};
