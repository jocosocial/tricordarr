import {useContext, createContext, Dispatch, SetStateAction} from 'react';
import {FezData, FezListData, FezPostData} from '../../../libraries/Structs/ControllerStructs';
import {FezListActionsType} from '../../Reducers/FezListReducers';
import {FezPostsActionsType} from '../../Reducers/FezPostsReducers';

interface TwitarrContextType {
  fez?: FezData;
  setFez: Dispatch<SetStateAction<FezData | undefined>>;
  fezList?: FezListData;
  dispatchFezList: Dispatch<FezListActionsType>;
  fezPostsData: FezPostData[];
  dispatchFezPostsData: Dispatch<FezPostsActionsType>;
}

export const TwitarrContext = createContext(<TwitarrContextType>{});

export const useTwitarr = () => useContext(TwitarrContext);
