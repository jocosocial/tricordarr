import {createContext, useContext} from 'react';

interface TwitarrContextType {
  openWebUrl: (url: string) => void;
}

export const TwitarrContext = createContext(<TwitarrContextType>{});

export const useTwitarr = () => useContext(TwitarrContext);
