import {useNavigation} from '@react-navigation/native';
import {useCallback, useEffect, useRef, useState} from 'react';

/**
 * Module-level registry of all menu close functions.
 * This allows NavigationContainer's onStateChange to close all menus
 * when deep linking occurs (e.g., notification taps).
 */
const menuCloseFunctions = new Set<() => void>();

/**
 * Register a menu's close function. Returns an unsubscribe function.
 */
export const registerMenuClose = (closeMenu: () => void) => {
  menuCloseFunctions.add(closeMenu);
  return () => {
    menuCloseFunctions.delete(closeMenu);
  };
};

/**
 * Close all registered menus. Called by NavigationContainer's onStateChange.
 */
export const closeAllMenus = () => {
  console.log('[MenuHook.ts] closeAllMenus called, registered menus:', menuCloseFunctions.size);
  menuCloseFunctions.forEach(closeMenu => {
    try {
      closeMenu();
    } catch (error) {
      console.error('[MenuHook.ts] Error closing menu:', error);
    }
  });
};

/**
 * Hook to manage the visibility of a menu. Attaches to the global navigation state
 * to dismiss the menu whenever a state change occurs.
 *
 * This used to be a bunch of custom functions such as:
 *   const handleNavigation = (screen) => {
 *     closeMenu();
 *     navigation.push(screen);
 *   };
 *
 * It was irksome duplicated code. And with the Navigation v7 upgrade the typing
 * became a pain in the ass.
 *
 * @returns An object with the visibility state, open menu function, and close menu function.
 */
export const useMenu = () => {
  const [visible, setVisible] = useState(false);
  const navigation = useNavigation();

  const openMenu = useCallback(() => {
    console.log('[MenuHook.ts] openMenu');
    setVisible(true);
  }, []);

  const closeMenu = useCallback(() => {
    console.log('[MenuHook.ts] closeMenu');
    setVisible(false);
  }, []);

  // Register this menu's close function so it can be closed by NavigationContainer's onStateChange
  // when deep linking occurs (e.g., notification taps)
  const closeMenuRef = useRef(closeMenu);
  const visibleRef = useRef(visible);

  useEffect(() => {
    closeMenuRef.current = closeMenu;
  }, [closeMenu]);

  useEffect(() => {
    visibleRef.current = visible;
  }, [visible]);

  useEffect(() => {
    const closeMenuWrapper = () => {
      if (visibleRef.current) {
        console.log('[MenuHook.ts] closeMenuWrapper called, closing menu');
        closeMenuRef.current();
      }
    };
    const unsubscribe = registerMenuClose(closeMenuWrapper);
    console.log('[MenuHook.ts] registered menu close function');
    return unsubscribe;
  }, []);

  // Also listen to navigation state changes for regular navigation
  // Similar to how AppDrawer handles this
  useEffect(() => {
    const unsubscribe = navigation.addListener('state', () => {
      if (visible) {
        console.log('[MenuHook.ts] navigation state changed, closing menu');
        setVisible(false);
      }
    });
    return unsubscribe;
  }, [navigation, visible]);

  return {visible, openMenu, closeMenu};
};
