import {useContext, createContext, Dispatch, SetStateAction} from 'react';
import {FezData, FezListData} from '../../../libraries/Structs/ControllerStructs';

interface TwitarrContextType {
  fez?: FezData;
  setFez: Dispatch<SetStateAction<FezData | undefined>>;
  fezList?: FezListData;
  setFezList: Dispatch<SetStateAction<FezListData | undefined>>;
}

export const TwitarrContext = createContext(<TwitarrContextType>{});

export const useTwitarr = () => useContext(TwitarrContext);
