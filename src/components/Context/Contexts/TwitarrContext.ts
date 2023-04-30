import {useContext, createContext, Dispatch, SetStateAction} from 'react';
import {FezData} from '../../../libraries/Structs/ControllerStructs';

interface TwitarrContextType {
  fez?: FezData;
  setFez: Dispatch<SetStateAction<FezData | undefined>>;
}

export const TwitarrContext = createContext(<TwitarrContextType>{});

export const useTwitarr = () => useContext(TwitarrContext);
