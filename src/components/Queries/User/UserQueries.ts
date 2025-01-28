import {KeywordData, ProfilePublicData} from '../../../libraries/Structs/ControllerStructs';
import {TokenAuthQueryOptionsType, useTokenAuthQuery} from '../TokenAuthQuery';
import {KeywordType} from '../../../libraries/Types';

// The Keyword queries are a good example of the most recent pattern of designing queries and mutations.

interface KeywordQueryProps {
  keywordType: KeywordType;
  options?: TokenAuthQueryOptionsType<KeywordData>;
}

export const useUserKeywordQuery = ({keywordType, options}: KeywordQueryProps) => {
  return useTokenAuthQuery<KeywordData>(`/user/${keywordType}`, options);
};

export const useUserProfileQuery = <TData = ProfilePublicData>(options: TokenAuthQueryOptionsType<TData> = {}) => {
  return useTokenAuthQuery<TData>('/user/profile', options);
};
