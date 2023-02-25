import {createContext, Dispatch, SetStateAction, useContext} from 'react';
import {ProfilePublicData, TokenStringData} from '../../libraries/structs/ControllerStructs';

export interface UserDataContextType {
  profilePublicData: ProfilePublicData;
  setProfilePublicData: Dispatch<SetStateAction<ProfilePublicData>>;
  tokenStringData: TokenStringData;
  setTokenStringData: Dispatch<SetStateAction<TokenStringData>>;
}

export const UserDataContext = createContext(<UserDataContextType>{});

export const useUserData = () => useContext(UserDataContext);
