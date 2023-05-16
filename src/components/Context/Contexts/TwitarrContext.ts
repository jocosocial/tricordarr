import {useContext, createContext, Dispatch, SetStateAction} from 'react';
import {FezData, FezPostData} from '../../../libraries/Structs/ControllerStructs';
import {FezListActionsType} from '../../Reducers/FezListReducers';
import {FezPostsActionsType} from '../../Reducers/FezPostsReducers';

interface TwitarrContextType {
  fez?: FezData;
  setFez: Dispatch<SetStateAction<FezData | undefined>>;
  fezList: FezData[];
  dispatchFezList: Dispatch<FezListActionsType>;
  fezPostsData: FezPostData[];
  dispatchFezPostsData: Dispatch<FezPostsActionsType>;
  searchString: string;
  setSearchString: Dispatch<SetStateAction<string>>;
}

export const TwitarrContext = createContext(<TwitarrContextType>{});

export const useTwitarr = () => useContext(TwitarrContext);
