import {createContext, useContext} from 'react';
import {TokenStringData} from '../../../libraries/Structs/ControllerStructs';

interface AuthContextType {
  signIn: (tokenData: TokenStringData) => Promise<void>;
  signOut: () => Promise<void>;
  tokenData: TokenStringData | null;
  isLoggedIn: boolean;
  isLoading: boolean;
}

export const AuthContext = createContext(<AuthContextType>{});

export const useAuth = () => useContext(AuthContext);
