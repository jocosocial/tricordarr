import {createContext, Dispatch, SetStateAction, useContext} from 'react';
import {ProfilePublicData} from '../../../libraries/Structs/ControllerStructs';

export interface UserDataContextType {
  profilePublicData: ProfilePublicData;
  setProfilePublicData: Dispatch<SetStateAction<ProfilePublicData>>;
  isLoading: boolean;
  setIsLoading: Dispatch<SetStateAction<boolean>>;
  // authToken: string;
  // setAuthToken: Dispatch<SetStateAction<string>>;
  isLoggedIn: boolean;
  setIsLoggedIn: Dispatch<SetStateAction<boolean>>;
}

export const UserDataContext = createContext(<UserDataContextType>{});

export const useUserData = () => useContext(UserDataContext);
