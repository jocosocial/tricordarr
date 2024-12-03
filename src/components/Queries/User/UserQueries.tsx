import {
  CreatedUserData,
  ErrorResponse,
  KeywordData,
  UserCreateData,
  UserHeader,
  UserPasswordData,
  UserUsernameData,
} from '../../../libraries/Structs/ControllerStructs';
import {useTokenAuthQuery} from '../TokenAuthQuery';
import {AxiosResponse} from 'axios';
import {KeywordAction, KeywordType} from '../../../libraries/Types';
import {useTokenAuthMutation} from '../TokenAuthMutation';
import {useSwiftarrQueryClient} from '../../Context/Contexts/SwiftarrQueryClientContext.ts';

// The Keyword queries are a good example of the most recent pattern of designing queries and mutations.

interface KeywordQueryProps {
  keywordType: KeywordType;
}

export const useUserKeywordQuery = ({keywordType}: KeywordQueryProps) => {
  return useTokenAuthQuery<KeywordData>(`/user/${keywordType}`);
};

interface KeywordMutationProps {
  action: KeywordAction;
  keywordType: KeywordType;
  keyword: string;
}

export const useUserKeywordMutation = (options = {}) => {
  const {ServerQueryClient} = useSwiftarrQueryClient();

  const keywordQueryHandler = async ({
    action,
    keywordType,
    keyword,
  }: KeywordMutationProps): Promise<AxiosResponse<KeywordData, ErrorResponse>> => {
    return await ServerQueryClient.post(`/user/${keywordType}/${action}/${keyword}`);
  };

  return useTokenAuthMutation(keywordQueryHandler, options);
};

interface UserPasswordMutationProps {
  userPasswordData: UserPasswordData;
}

export const useUserPasswordMutation = (options = {}) => {
  const {ServerQueryClient} = useSwiftarrQueryClient();

  const userPasswordHandler = async ({userPasswordData}: UserPasswordMutationProps): Promise<AxiosResponse<void>> =>
    await ServerQueryClient.post('/user/password', userPasswordData);

  return useTokenAuthMutation(userPasswordHandler, options);
};

interface UserUsernameMutationProps {
  userUsernameData: UserUsernameData;
  userID?: string;
}

export const useUserUsernameMutation = (options = {}) => {
  const {ServerQueryClient} = useSwiftarrQueryClient();

  const userUsernameHandler = async ({
    userUsernameData,
    userID,
  }: UserUsernameMutationProps): Promise<AxiosResponse<void>> => {
    let url = '/user/username';
    if (userID) {
      url = `/user/${userID}/username`;
    }
    return await ServerQueryClient.post(url, userUsernameData);
  };

  return useTokenAuthMutation(userUsernameHandler, options);
};

export const useUserCreateQuery = (options = {}) => {
  const {ServerQueryClient} = useSwiftarrQueryClient();

  const userCreateHandler = async ({
    username,
    password,
    verification,
  }: UserCreateData): Promise<AxiosResponse<CreatedUserData>> =>
    await ServerQueryClient.post('/user/create', {username, password, verification});

  return useTokenAuthMutation(userCreateHandler, options);
};

export const useUserFindQuery = (username: string) => {
  return useTokenAuthQuery<UserHeader>(`/users/find/${username}`);
};
