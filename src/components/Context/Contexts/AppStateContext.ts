import {createContext, Dispatch, SetStateAction, useContext} from 'react';

export interface AppStateContext {
  appState: any;
  appStateVisible: any;
  setAppStateVisible: Dispatch<SetStateAction<any>>;
}

export const AppStateContext = createContext({} as AppStateContext);

export const useAppState = () => useContext(AppStateContext);
