import {createContext, Dispatch, SetStateAction, useContext} from 'react';
import {ProfilePublicData} from '../../../libraries/Structs/ControllerStructs';

export interface UserDataContextType {
  profilePublicData?: ProfilePublicData;
  setProfilePublicData: Dispatch<SetStateAction<ProfilePublicData | undefined>>;
}

export const UserDataContext = createContext(<UserDataContextType>{});

export const useUserData = () => useContext(UserDataContext);
