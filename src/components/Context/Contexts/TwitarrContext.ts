import {useContext, createContext, Dispatch, SetStateAction} from 'react';

interface TwitarrContextType {
  searchString: string;
  setSearchString: Dispatch<SetStateAction<string>>;
  openWebUrl: (url: string) => void;
}

export const TwitarrContext = createContext(<TwitarrContextType>{});

export const useTwitarr = () => useContext(TwitarrContext);
