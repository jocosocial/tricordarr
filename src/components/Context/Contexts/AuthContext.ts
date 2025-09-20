import {createContext, useContext} from 'react';
import {TokenStringData} from '../../../Libraries/Structs/ControllerStructs';

interface AuthContextType {
  signIn: (tokenData: TokenStringData, preRegistrationMode?: boolean) => Promise<void>;
  signOut: (preRegistrationMode?: boolean) => Promise<void>;
  restore: () => Promise<void>;
  tokenData: TokenStringData | null;
  isLoggedIn: boolean;
  isLoading: boolean;
}

export const AuthContext = createContext(<AuthContextType>{});

export const useAuth = () => useContext(AuthContext);
