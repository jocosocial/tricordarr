import {
  CreatedUserData,
  ErrorResponse,
  KeywordData,
  ProfilePublicData,
  TokenStringData,
  UserCreateData,
  UserPasswordData,
  UserUsernameData,
} from '../../../libraries/Structs/ControllerStructs';
import {useTokenAuthQuery} from '../TokenAuthQuery';
import axios, {AxiosError, AxiosResponse} from 'axios';
import {useMutation} from '@tanstack/react-query';
import {KeywordAction, KeywordType} from '../../../libraries/Types';
import {useErrorHandler} from '../../Context/Contexts/ErrorHandlerContext';

export const useUserProfileQuery = () => {
  return useTokenAuthQuery<ProfilePublicData>({
    queryKey: ['/user/profile'],
  });
};

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
  const {setErrorMessage} = useErrorHandler();
  return useMutation<AxiosResponse<KeywordData>, AxiosError<ErrorResponse>, KeywordMutationProps>(keywordQueryHandler, {
    onError: error => {
      setErrorMessage(error.response?.data.reason || error.message);
    },
    ...options,
  });
};

interface UserPasswordMutationProps {
  userPasswordData: UserPasswordData;
}

const userPasswordHandler = async ({userPasswordData}: UserPasswordMutationProps): Promise<AxiosResponse<void>> =>
  await axios.post('/user/password', userPasswordData);

export const useUserPasswordMutation = (options = {}) => {
  const {setErrorMessage} = useErrorHandler();
  return useMutation<AxiosResponse<void>, AxiosError<ErrorResponse>, UserPasswordMutationProps>(userPasswordHandler, {
    onError: error => {
      setErrorMessage(error.response?.data.reason || error.message);
    },
    ...options,
  });
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
  const {setErrorMessage} = useErrorHandler();
  return useMutation<AxiosResponse<void>, AxiosError<ErrorResponse>, UserUsernameMutationProps>(userUsernameHandler, {
    onError: error => {
      setErrorMessage(error.response?.data.reason || error.message);
    },
    ...options,
  });
};

const userCreateHandler = async ({
  username,
  password,
  verification,
}: UserCreateData): Promise<AxiosResponse<CreatedUserData>> =>
  await axios.post('/user/create', {username, password, verification});

export const useUserCreateQuery = (options = {}) => {
  const {setErrorMessage} = useErrorHandler();
  return useMutation<AxiosResponse<CreatedUserData>, AxiosError<ErrorResponse>, UserCreateData>(userCreateHandler, {
    onError: error => {
      setErrorMessage(error.response?.data.reason || error.message);
    },
    ...options,
  });
};
