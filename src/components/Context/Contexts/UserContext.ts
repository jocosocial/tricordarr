import {createContext, Dispatch, SetStateAction, useContext} from 'react';

export interface UserContextType {
  isUserLoggedIn: boolean;
  setIsUserLoggedIn: Dispatch<SetStateAction<boolean>>;
}

export const UserContext = createContext({} as UserContextType);

export const useUserContext = () => useContext(UserContext);
