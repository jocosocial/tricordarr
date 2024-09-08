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
import axios, {AxiosResponse} from 'axios';
import {KeywordAction, KeywordType} from '../../../libraries/Types';
import {useTokenAuthMutation} from '../TokenAuthMutation';

// The Keyword queries are a good example of the most recent pattern of designing queries and mutations.

interface KeywordQueryProps {
  keywordType: KeywordType;
}

export const useUserKeywordQuery = ({keywordType}: KeywordQueryProps) => {
  return useTokenAuthQuery<KeywordData>({
    queryKey: [`/user/${keywordType}`],
  });
};

interface KeywordMutationProps {
  action: KeywordAction;
  keywordType: KeywordType;
  keyword: string;
}

const keywordQueryHandler = async ({
  action,
  keywordType,
  keyword,
}: KeywordMutationProps): Promise<AxiosResponse<KeywordData, ErrorResponse>> => {
  return await axios.post(`/user/${keywordType}/${action}/${keyword}`);
};

export const useUserKeywordMutation = (options = {}) => {
  return useTokenAuthMutation(keywordQueryHandler, options);
};

interface UserPasswordMutationProps {
  userPasswordData: UserPasswordData;
}

const userPasswordHandler = async ({userPasswordData}: UserPasswordMutationProps): Promise<AxiosResponse<void>> =>
  await axios.post('/user/password', userPasswordData);

export const useUserPasswordMutation = (options = {}) => {
  return useTokenAuthMutation(userPasswordHandler, options);
};

interface UserUsernameMutationProps {
  userUsernameData: UserUsernameData;
  userID?: string;
}

const userUsernameHandler = async ({
  userUsernameData,
  userID,
}: UserUsernameMutationProps): Promise<AxiosResponse<void>> => {
  let url = '/user/username';
  if (userID) {
    url = `/user/${userID}/username`;
  }
  return await axios.post(url, userUsernameData);
};

export const useUserUsernameMutation = (options = {}) => {
  return useTokenAuthMutation(userUsernameHandler, options);
};

const userCreateHandler = async ({
  username,
  password,
  verification,
}: UserCreateData): Promise<AxiosResponse<CreatedUserData>> =>
  await axios.post('/user/create', {username, password, verification});

export const useUserCreateQuery = (options = {}) => {
  return useTokenAuthMutation(userCreateHandler, options);
};

export const useUserFindQuery = (username: string) => {
  return useTokenAuthQuery<UserHeader>(`/users/find/${username}`);
};
