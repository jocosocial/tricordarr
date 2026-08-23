import {createContext, useContext} from 'react';

export interface ConfirmLogoutOptions {
  allDevices?: boolean;
  /**
   * Called after a successful sign-out. SignOutProvider sits above the root
   * navigator (see docs/Navigation.md), so it cannot safely call
   * useNavigation() itself — the caller supplies its own screen-scoped
   * navigation callback (e.g. () => navigation.goBack()).
   */
  onLoggedOut?: () => void;
}

export interface SignOutContextType {
  performSignOut: () => Promise<void>;
  confirmLogout: (options?: ConfirmLogoutOptions) => void;
}

export const SignOutContext = createContext<SignOutContextType>({
  performSignOut: async () => {
    throw new Error('SignOutProvider not initialized');
  },
  confirmLogout: () => {
    throw new Error('SignOutProvider not initialized');
  },
});

export const useSignOut = () => useContext(SignOutContext);
