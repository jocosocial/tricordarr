import React, {PropsWithChildren, useCallback, useRef} from 'react';

import {MenuContext} from '#src/Context/Contexts/MenuContext';

/**
 * Provider that manages menu state globally.
 * Allows menus to register their close functions so they can be closed
 * when navigation occurs via deep linking.
 *
 * This is a Cursor-ism.
 */
export const MenuProvider = ({children}: PropsWithChildren) => {
  const closeMenuFunctionsRef = useRef<Set<() => void>>(new Set());

  const registerCloseMenu = useCallback((closeMenu: () => void) => {
    closeMenuFunctionsRef.current.add(closeMenu);
    return () => {
      closeMenuFunctionsRef.current.delete(closeMenu);
    };
  }, []);

  const closeAllMenus = useCallback(() => {
    console.log('[MenuProvider.tsx] closeAllMenus called, registered menus:', closeMenuFunctionsRef.current.size);
    closeMenuFunctionsRef.current.forEach(closeMenu => {
      try {
        closeMenu();
      } catch (error) {
        console.error('[MenuProvider.tsx] Error closing menu:', error);
      }
    });
  }, []);

  return <MenuContext.Provider value={{registerCloseMenu, closeAllMenus}}>{children}</MenuContext.Provider>;
};
