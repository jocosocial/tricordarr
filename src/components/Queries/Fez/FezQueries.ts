import axios, {AxiosError, AxiosResponse} from 'axios';
import {useInfiniteQuery, useMutation, useQuery} from '@tanstack/react-query';
import {ErrorResponse, FezContentData, FezData, FezListData} from '../../../libraries/Structs/ControllerStructs';
import {useErrorHandler} from '../../Context/Contexts/ErrorHandlerContext';
import {PrivilegedUserAccounts} from '../../../libraries/Enums/UserAccessLevel';

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

export const useSeamailListQuery = (forUser?: keyof typeof PrivilegedUserAccounts) => {
  let queryRoute = '/fez/joined?type=closed&type=open';
  if (forUser) {
    // The .toLowerCase() is a workaround for https://github.com/jocosocial/swiftarr/issues/222
    queryRoute = `${queryRoute}&foruser=${forUser.toLowerCase()}`;
  }
  return useQuery<FezListData>({
    queryKey: [queryRoute],
  });
};

interface SeamailQueryProps {
  pageSize?: number;
  fezID: string;
}

export const useSeamailQuery = ({pageSize = 10, fezID}: SeamailQueryProps) => {
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
}
