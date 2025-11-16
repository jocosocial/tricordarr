import {createContext, useContext} from 'react';

/**
 * Context to manage menu state globally.
 * Allows components like AppEventHandler to close all menus when navigation occurs
 * via deep linking (e.g., notification taps).
 */
export interface MenuContextType {
  /**
   * Register a function that closes a menu. Returns an unsubscribe function.
   */
  registerCloseMenu: (closeMenu: () => void) => () => void;
  /**
   * Close all registered menus.
   */
  closeAllMenus: () => void;
}

export const MenuContext = createContext<MenuContextType | null>(null);

export const useMenuContext = () => {
  const context = useContext(MenuContext);
  // Return a no-op implementation if context is not available
  // This allows the hook to be used safely even if MenuProvider is missing
  if (!context) {
    return {
      registerCloseMenu: () => () => {},
      closeAllMenus: () => {},
    };
  }
  return context;
};
