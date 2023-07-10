import React, {useState, PropsWithChildren} from 'react';
import {MenuContext} from '../Contexts/MenuContext';

export const MenuProvider = ({children}: PropsWithChildren) => {
  const [menuVisible, setMenuVisible] = useState(false);

  const openMenu = () => setMenuVisible(true);
  const closeMenu = () => setMenuVisible(false);

  return (
    <MenuContext.Provider value={{menuVisible, setMenuVisible, openMenu, closeMenu}}>
      {children}
    </MenuContext.Provider>
  );
};
