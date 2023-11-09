import axios, {AxiosError, AxiosResponse} from 'axios';
import {useInfiniteQuery, useMutation} from '@tanstack/react-query';
import {ErrorResponse, FezContentData, FezData, FezListData} from '../../../libraries/Structs/ControllerStructs';
import {useErrorHandler} from '../../Context/Contexts/ErrorHandlerContext';
import {PrivilegedUserAccounts} from '../../../libraries/Enums/UserAccessLevel';
import {FezType} from '../../../libraries/Enums/FezType';
import {getNextPageParam, getPreviousPageParam, PaginationParams} from '../Pagination';
import {useTokenAuthInfiniteQuery} from '../TokenAuthQuery';

// https://medium.com/@deshan.m/reusable-react-query-hooks-with-typescript-simplifying-api-calls-f2583b24c82a

interface FezMutationProps {
  fezContentData: FezContentData;
}

const queryHandler = async ({fezContentData}: FezMutationProps): Promise<AxiosResponse<FezData>> => {
  return await axios.post('/fez/create', fezContentData);
};

export const useFezMutation = (retry = 0) => {
  const {setErrorMessage} = useErrorHandler();
  return useMutation<AxiosResponse<FezData>, AxiosError<ErrorResponse>, FezMutationProps>(queryHandler, {
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
}

export const useSeamailListQuery = ({pageSize, forUser, search}: SeamailListQueryOptions = {pageSize: 50}) => {
  const {setErrorMessage} = useErrorHandler();
  return useTokenAuthInfiniteQuery<FezListData, AxiosError<ErrorResponse>>(
    ['/fez/joined?type=closed&type=open'],
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
    },
  );
};

export const useSeamailQuery = ({pageSize = 50, fezID}: SeamailQueryProps) => {
  return useInfiniteQuery<FezData, Error>(
    // @TODO the key needs start too
    [`/fez/${fezID}?limit=${pageSize}`],
    async ({pageParam = {start: undefined, limit: pageSize}}) => {
      const {data: responseData} = await axios.get<FezData>(
        `/fez/${fezID}?limit=${pageParam.limit}&start=${pageParam.start}`,
      );
      return responseData;
    },
    {
      getNextPageParam: lastPage => {
        if (lastPage.members) {
          const {limit, start, total} = lastPage.members.paginator;
          const nextStart = start + limit;
          return nextStart < total ? {start: nextStart, limit} : undefined;
        }
        throw new Error('getNextPageParam no member');
      },
      getPreviousPageParam: firstPage => {
        if (firstPage.members) {
          const {limit, start} = firstPage.members.paginator;
          const prevStart = start - limit;
          return prevStart >= 0 ? {start: prevStart, limit} : undefined;
        }
        throw new Error('getPreviousPageParam no member');
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
}

export const useLfgListQuery = ({
  cruiseDay,
  fezType,
  excludeFezType,
  hidePast = false,
  pageSize = 50,
  endpoint = 'open',
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
