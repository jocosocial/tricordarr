import {createContext} from 'react';

// @TODO pick up here

export interface UserDataContextType {
  profile: string;
}

export const UserDataContext = createContext({});
