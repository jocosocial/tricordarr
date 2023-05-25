import {createContext, useContext} from 'react';
import {TokenStringData} from '../../../libraries/Structs/ControllerStructs';

interface AuthContextType {
  signIn: (tokenData: TokenStringData) => Promise<void>;
  signOut: () => Promise<void>;
  signUp: (tokenData: TokenStringData) => void;
  tokenData: TokenStringData | null;
  isLoggedIn: boolean;
}

export const AuthContext = createContext(<AuthContextType>{});

export const useAuth = () => useContext(AuthContext);
