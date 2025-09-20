import {useSwiftarrQueryClient} from '#src/Context/Contexts/SwiftarrQueryClientContext';
import {useTokenAuthMutation} from '#src/Queries/TokenAuthMutation';
import {
  CreatedUserData,
  KeywordData,
  UserCreateData,
  UserPasswordData,
  UserUsernameData,
} from '#src/Structs/ControllerStructs';
import {KeywordAction, KeywordType} from '#src/Types';

interface KeywordMutationProps {
  action: KeywordAction;
  keywordType: KeywordType;
  keyword: string;
}

export const useUserKeywordMutation = (options = {}) => {
  const {apiPost} = useSwiftarrQueryClient();

  const keywordQueryHandler = async ({action, keywordType, keyword}: KeywordMutationProps) => {
    return await apiPost<KeywordData>(`/user/${keywordType}/${action}/${keyword}`);
  };

  return useTokenAuthMutation(keywordQueryHandler, options);
};

interface UserPasswordMutationProps {
  userPasswordData: UserPasswordData;
}

export const useUserPasswordMutation = (options = {}) => {
  const {apiPost} = useSwiftarrQueryClient();

  const userPasswordHandler = async ({userPasswordData}: UserPasswordMutationProps) =>
    await apiPost<void, UserPasswordData>('/user/password', userPasswordData);

  return useTokenAuthMutation(userPasswordHandler, options);
};

interface UserUsernameMutationProps {
  userUsernameData: UserUsernameData;
  userID?: string;
}

export const useUserUsernameMutation = (options = {}) => {
  const {apiPost} = useSwiftarrQueryClient();

  const userUsernameHandler = async ({userUsernameData, userID}: UserUsernameMutationProps) => {
    let url = '/user/username';
    if (userID) {
      url = `/user/${userID}/username`;
    }
    return await apiPost<void, UserUsernameData>(url, userUsernameData);
  };

  return useTokenAuthMutation(userUsernameHandler, options);
};

export const useUserCreateQuery = (options = {}) => {
  const {apiPost} = useSwiftarrQueryClient();

  const userCreateHandler = async ({username, password, verification}: UserCreateData) =>
    await apiPost<CreatedUserData, UserCreateData>('/user/create', {username, password, verification});

  return useTokenAuthMutation(userCreateHandler, options);
};
