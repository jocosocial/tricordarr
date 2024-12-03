import {AxiosResponse} from 'axios';
import {FezContentData, FezData, FezListData} from '../../../libraries/Structs/ControllerStructs';
import {PrivilegedUserAccounts} from '../../../libraries/Enums/UserAccessLevel';
import {FezType} from '../../../libraries/Enums/FezType';
import {useTokenAuthPaginationQuery} from '../TokenAuthQuery';
import {useTokenAuthMutation} from '../TokenAuthMutation';
import {QueryKey} from '@tanstack/react-query';
import {useSwiftarrQueryClient} from '../../Context/Contexts/SwiftarrQueryClientContext.ts';

// https://medium.com/@deshan.m/reusable-react-query-hooks-with-typescript-simplifying-api-calls-f2583b24c82a

interface FezCreateMutationProps {
  fezContentData: FezContentData;
}

export const useFezCreateMutation = () => {
  const {ServerQueryClient} = useSwiftarrQueryClient();

  const fezCreateQueryHandler = async ({fezContentData}: FezCreateMutationProps): Promise<AxiosResponse<FezData>> => {
    return await ServerQueryClient.post('/fez/create', fezContentData);
  };

  return useTokenAuthMutation(fezCreateQueryHandler);
};

interface FezUpdateMutationProps extends FezCreateMutationProps {
  fezID: string;
}

export const useFezUpdateMutation = () => {
  const {ServerQueryClient} = useSwiftarrQueryClient();

  const fezUpdateQueryHandler = async ({
    fezID,
    fezContentData,
  }: FezUpdateMutationProps): Promise<AxiosResponse<FezData>> => {
    return await ServerQueryClient.post(`/fez/${fezID}/update`, fezContentData);
  };

  return useTokenAuthMutation(fezUpdateQueryHandler);
};

interface SeamailQueryProps {
  fezID: string;
}

interface SeamailListQueryOptions {
  forUser?: keyof typeof PrivilegedUserAccounts;
  search?: string;
  options?: {};
}

export const useSeamailListQuery = ({forUser, search, options = {}}: SeamailListQueryOptions) => {
  const queryParams = {
    ...(search && {search: search}),
    // Heads up, Swiftarr is case-sensitive with query params. forUser != foruser.
    ...(forUser !== undefined && {foruser: forUser.toLowerCase()}),
    type: [FezType.closed, FezType.open],
  };
  const queryKey: QueryKey = ['/fez/joined', queryParams, search];
  return useTokenAuthPaginationQuery<FezListData>('/fez/joined', options, queryParams, queryKey);
};

export const useSeamailQuery = ({fezID}: SeamailQueryProps) => {
  return useTokenAuthPaginationQuery<FezData>(`/fez/${fezID}`);
};

interface LfgListQueryOptions {
  cruiseDay?: number;
  fezType?: keyof typeof FezType;
  hidePast?: boolean;
  endpoint?: 'open' | 'joined' | 'owner';
  excludeFezType?: FezType[];
  options?: {};
}

export const useLfgListQuery = ({
  cruiseDay,
  fezType,
  excludeFezType = [FezType.open, FezType.closed],
  hidePast = false,
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
  return useTokenAuthPaginationQuery<FezListData>(`/fez/${endpoint}`, options, queryParams);
};

interface FezCancelMutationProps {
  fezID: string;
}

export const useFezCancelMutation = () => {
  const {ServerQueryClient} = useSwiftarrQueryClient();

  const cancelQueryHandler = async ({fezID}: FezCancelMutationProps): Promise<AxiosResponse<FezData>> => {
    return await ServerQueryClient.post(`/fez/${fezID}/cancel`);
  };

  return useTokenAuthMutation(cancelQueryHandler);
};
