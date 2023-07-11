import {useContext, createContext, Dispatch, SetStateAction} from 'react';

interface DrawerContextType {
  drawerOpen: boolean;
  setDrawerOpen: Dispatch<SetStateAction<boolean>>;
}

export const DrawerContext = createContext(<DrawerContextType>{});

export const useDrawer = () => useContext(DrawerContext);
