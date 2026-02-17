import {createContext, useContext} from 'react';

interface LinkingContextType {
  openWebUrl: (url: string) => void;
  openAppUrl: (url: string, queryParams?: Record<string, string | number | boolean>) => void;
}

export const LinkingContext = createContext(<LinkingContextType>{});

export const useLinking = () => useContext(LinkingContext);
