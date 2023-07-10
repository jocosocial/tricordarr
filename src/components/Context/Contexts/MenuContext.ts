import {useContext, createContext, Dispatch, SetStateAction} from 'react';

interface MenuContextType {
  menuVisible: boolean;
  setMenuVisible: Dispatch<SetStateAction<boolean>>;
  openMenu: () => void;
  closeMenu: () => void;
}

export const MenuContext = createContext(<MenuContextType>{});

export const useMenu = () => useContext(MenuContext);
