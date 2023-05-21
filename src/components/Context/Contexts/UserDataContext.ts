import {createContext, Dispatch, SetStateAction, useContext} from 'react';
import {ProfilePublicData} from '../../../libraries/Structs/ControllerStructs';
import {UserAccessLevel} from '../../../libraries/Enums/UserAccessLevel';

export interface UserDataContextType {
  profilePublicData?: ProfilePublicData;
  setProfilePublicData: Dispatch<SetStateAction<ProfilePublicData | undefined>>;
}

export const UserDataContext = createContext(<UserDataContextType>{});

export const useUserData = () => useContext(UserDataContext);
