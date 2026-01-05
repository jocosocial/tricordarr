import {createContext, useContext} from 'react';

export interface SignOutContextType {
  performSignOut: () => Promise<void>;
}

export const SignOutContext = createContext<SignOutContextType>({
  performSignOut: async () => {
    throw new Error('SignOutProvider not initialized');
  },
});

export const useSignOut = () => useContext(SignOutContext);
