import {useContext, createContext, Dispatch, SetStateAction} from 'react';
import {FezData, FezListData} from '../../../libraries/Structs/ControllerStructs';
import {InfiniteData} from '@tanstack/react-query';

interface TwitarrContextType {
  fez?: FezData;
  setFez: Dispatch<SetStateAction<FezData | undefined>>;
  fezList?: FezListData;
  setFezList: Dispatch<SetStateAction<FezListData | undefined>>;
  markFezRead: (fezID: string) => void;
  incrementFezPostCount: (fezID: string) => void;
  unshiftFez: (fezID: string) => void;
  fezPageData?: InfiniteData<FezData>;
  setFezPageData: Dispatch<SetStateAction<InfiniteData<FezData> | undefined>>;
}

export const TwitarrContext = createContext(<TwitarrContextType>{});

export const useTwitarr = () => useContext(TwitarrContext);
