import axios, {AxiosResponse} from 'axios';
import {FezContentData, FezData, FezListData} from '../../../libraries/Structs/ControllerStructs';
import {PrivilegedUserAccounts} from '../../../libraries/Enums/UserAccessLevel';
import {FezType} from '../../../libraries/Enums/FezType';
import {useTokenAuthPaginationQuery} from '../TokenAuthQuery';
import {useTokenAuthMutation} from '../TokenAuthMutation';

// https://medium.com/@deshan.m/reusable-react-query-hooks-with-typescript-simplifying-api-calls-f2583b24c82a

interface FezCreateMutationProps {
  fezContentData: FezContentData;
}

const fezCreateQueryHandler = async ({fezContentData}: FezCreateMutationProps): Promise<AxiosResponse<FezData>> => {
  return await axios.post('/fez/create', fezContentData);
};

export const useFezCreateMutation = () => {
  return useTokenAuthMutation(fezCreateQueryHandler);
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

export const useFezUpdateMutation = () => {
  return useTokenAuthMutation(fezUpdateQueryHandler);
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
  {pageSize, forUser, search, options = {}}: SeamailListQueryOptions = {pageSize: 5},
) => {
  const queryParams = {
    ...(search && {search: search}),
    // Heads up, Swiftarr is case-sensitive with query params. forUser != foruser.
    ...(forUser !== undefined && {foruser: forUser.toLowerCase()}),
    type: [FezType.closed, FezType.open],
  };
  return useTokenAuthPaginationQuery<FezListData>('/fez/joined', 5, options, queryParams);
  // const {setErrorMessage} = useErrorHandler();
  // return useTokenAuthInfiniteQuery<FezListData, AxiosError<ErrorResponse>>(
  //   ['/fez/joined', {type: ['closed', 'open'], search: search}],
  //   async ({pageParam = {limit: pageSize}}) => {
  //     const {start, limit} = pageParam as PaginationParams;
  //     const queryParams = {
  //       ...(start !== undefined && {start: start}),
  //       ...(limit !== undefined && {limit: limit}),
  //       ...(search && {search: search}),
  //       // Heads up, Swiftarr is case-sensitive with query params. forUser != foruser.
  //       ...(forUser !== undefined && {foruser: forUser.toLowerCase()}),
  //       type: [FezType.closed, FezType.open],
  //     };
  //     const {data: responseData} = await axios.get<FezListData>('/fez/joined', {
  //       params: queryParams,
  //     });
  //     return responseData;
  //   },
  //   {
  //     getNextPageParam: lastPage => getNextPageParam(lastPage.paginator),
  //     getPreviousPageParam: lastPage => getPreviousPageParam(lastPage.paginator),
  //     onError: error => {
  //       setErrorMessage(error?.response?.data.reason);
  //     },
  //     ...options,
  //   },
  // );
};

export const useSeamailQuery = ({pageSize = 5, fezID}: SeamailQueryProps) => {
  return useTokenAuthPaginationQuery(`/fez/${fezID}`, pageSize);
};

interface LfgListQueryOptions {
  cruiseDay?: number;
  fezType?: keyof typeof FezType;
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
  pageSize = 5,
  endpoint = 'open',
  options = {},
}: LfgListQueryOptions) => {
  const queryParams = {
    // Heads up, Swiftarr is case-sensitive with query params. forUser != foruser.
    // The !== undefined is necessary because 0 is false-y.
    ...(cruiseDay !== undefined && {cruiseday: cruiseDay}),
    ...(fezType !== undefined && {type: fezType}),
    ...(hidePast !== undefined && {hidePast: hidePast}),
    ...(excludeFezType && {excludetype: excludeFezType}),
  };
  return useTokenAuthPaginationQuery(`/fez/${endpoint}`, pageSize, options, queryParams);
};

interface FezCancelMutationProps {
  fezID: string;
}

const cancelQueryHandler = async ({fezID}: FezCancelMutationProps): Promise<AxiosResponse<FezData>> => {
  return await axios.post(`/fez/${fezID}/cancel`);
};

export const useFezCancelMutation = () => {
  return useTokenAuthMutation(cancelQueryHandler);
};
