import {createContext, useContext} from 'react';

interface TwitarrContextType {
  openWebUrl: (url: string) => void;
  openAppUrl: (url: string, queryParams?: Record<string, string | number | boolean>) => void;
}

export const TwitarrContext = createContext(<TwitarrContextType>{});

export const useTwitarr = () => useContext(TwitarrContext);
