import {createContext, Dispatch, SetStateAction, useContext} from 'react';
import {ProfilePublicData} from '../../../libraries/Structs/ControllerStructs';
import {UserAccessLevel} from '../../../libraries/Enums/UserAccessLevel';

export interface UserDataContextType {
  profilePublicData: ProfilePublicData;
  setProfilePublicData: Dispatch<SetStateAction<ProfilePublicData>>;
  isLoading: boolean;
  setIsLoading: Dispatch<SetStateAction<boolean>>;
  // authToken: string;
  // setAuthToken: Dispatch<SetStateAction<string>>;
  isLoggedIn: boolean;
  setIsLoggedIn: Dispatch<SetStateAction<boolean>>;
  accessLevel: UserAccessLevel;
  setAccessLevel: Dispatch<SetStateAction<UserAccessLevel>>;
}

export const UserDataContext = createContext(<UserDataContextType>{});

export const useUserData = () => useContext(UserDataContext);
