import {createContext, Dispatch, SetStateAction, useContext} from 'react';
import {ProfilePublicData, TokenStringData} from '../../../libraries/Structs/ControllerStructs';

export interface UserDataContextType {
  profilePublicData: ProfilePublicData;
  setProfilePublicData: Dispatch<SetStateAction<ProfilePublicData>>;
  tokenStringData: TokenStringData;
  setTokenStringData: Dispatch<SetStateAction<TokenStringData>>;
  isLoggedIn: unknown;
  setIsLoggedIn: Dispatch<SetStateAction<unknown>>;
}

export const UserDataContext = createContext(<UserDataContextType>{});

export const useUserData = () => useContext(UserDataContext);
