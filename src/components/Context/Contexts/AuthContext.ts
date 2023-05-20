import {createContext, useContext} from 'react';
import {TokenStringData} from '../../../libraries/Structs/ControllerStructs';

interface AuthContextType {
  signIn: (tokenData: TokenStringData) => void;
  signOut: () => void;
  signUp: (tokenData: TokenStringData) => void;
  tokenData: TokenStringData | null;
}

export const AuthContext = createContext(<AuthContextType>{});

export const useAuth = () => useContext(AuthContext);
