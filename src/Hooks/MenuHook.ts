import {useNavigation} from '@react-navigation/native';
import {useEffect, useState} from 'react';

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

  const openMenu = () => setVisible(true);
  const closeMenu = () => {
    console.log('[MenuHook.ts] closeMenu');
    setVisible(false);
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('state', closeMenu);
    return unsubscribe;
  }, [navigation]);

  return {visible, openMenu, closeMenu};
};
