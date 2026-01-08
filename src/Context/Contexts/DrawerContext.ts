import {createContext, Dispatch, ReactNode, SetStateAction, useContext} from 'react';

interface DrawerContextType {
  drawerOpen: boolean;
  setDrawerOpen: Dispatch<SetStateAction<boolean>>;
  getLeftMainHeaderButtons: () => ReactNode;
  getLeftBackHeaderButtons: () => ReactNode;
}

export const DrawerContext = createContext(<DrawerContextType>{});

export const useDrawer = () => useContext(DrawerContext);
