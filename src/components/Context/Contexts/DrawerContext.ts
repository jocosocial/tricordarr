import {useContext, createContext, Dispatch, SetStateAction, ReactNode} from 'react';

interface DrawerContextType {
  drawerOpen: boolean;
  setDrawerOpen: Dispatch<SetStateAction<boolean>>;
  getLeftMainHeaderButtons: () => ReactNode;
  getRightMainHeaderButtons: () => ReactNode;
}

export const DrawerContext = createContext(<DrawerContextType>{});

export const useDrawer = () => useContext(DrawerContext);
