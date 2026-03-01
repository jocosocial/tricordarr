import {STALE} from '#src/Libraries/Time/Time';
import {TokenAuthQueryOptionsType, useTokenAuthQuery} from '#src/Queries/TokenAuthQuery';
import {CurrentUserData, KeywordData, ProfilePublicData} from '#src/Structs/ControllerStructs';
import {KeywordType} from '#src/Types';

// The Keyword queries are a good example of the most recent pattern of designing queries and mutations.

interface KeywordQueryProps {
  keywordType: KeywordType;
  options?: TokenAuthQueryOptionsType<KeywordData>;
}

export const useUserKeywordQuery = ({keywordType, options}: KeywordQueryProps) => {
  return useTokenAuthQuery<KeywordData>(`/user/${keywordType}`, options);
};

export const useUserProfileQuery = <TData = ProfilePublicData>(options: TokenAuthQueryOptionsType<TData> = {}) => {
  return useTokenAuthQuery<TData>('/user/profile', {
    staleTime: STALE.MINUTES.THIRTY,
    ...options,
  });
};

export const useUserWhoamiQuery = (
  options: TokenAuthQueryOptionsType<CurrentUserData> = {staleTime: STALE.MINUTES.THIRTY},
) => {
  return useTokenAuthQuery<CurrentUserData>('/user/whoami', options);
};
