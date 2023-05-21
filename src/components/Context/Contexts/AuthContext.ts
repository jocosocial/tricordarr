import {createContext, useContext} from 'react';
import {TokenStringData} from '../../../libraries/Structs/ControllerStructs';
import {UserAccessLevel} from '../../../libraries/Enums/UserAccessLevel';

interface AuthContextType {
  signIn: (tokenData: TokenStringData) => void;
  signOut: () => void;
  signUp: (tokenData: TokenStringData) => void;
  tokenData: TokenStringData | null;
  isLoggedIn: boolean;
}

export const AuthContext = createContext(<AuthContextType>{});

export const useAuth = () => useContext(AuthContext);
