import {useContext, createContext, Dispatch, SetStateAction} from 'react';
import {EventData, FezData, FezPostData} from '../../../libraries/Structs/ControllerStructs';
import {FezListActionsType} from '../../Reducers/Fez/FezListReducers';
import {FezPostsActionsType} from '../../Reducers/Fez/FezPostsReducers';
import {EventListActionsType} from '../../Reducers/Schedule/EventListReducer';
import {ScheduleListActionsType} from '../../Reducers/Schedule/ScheduleListReducer';

interface TwitarrContextType {
  fez?: FezData;
  setFez: Dispatch<SetStateAction<FezData | undefined>>;
  fezList: FezData[];
  dispatchFezList: Dispatch<FezListActionsType>;
  fezPostsData: FezPostData[];
  dispatchFezPostsData: Dispatch<FezPostsActionsType>;
  searchString: string;
  setSearchString: Dispatch<SetStateAction<string>>;
  eventList: EventData[];
  dispatchEventList: Dispatch<EventListActionsType>;
  scheduleList: (EventData | FezData)[];
  dispatchScheduleList: Dispatch<ScheduleListActionsType>;
  lfgList: FezData[];
  dispatchLfgList: Dispatch<FezListActionsType>;
  lfg?: FezData;
  setLfg: Dispatch<SetStateAction<FezData | undefined>>;
  lfgPostsData: FezPostData[];
  dispatchLfgPostsData: Dispatch<FezPostsActionsType>;
}

export const TwitarrContext = createContext(<TwitarrContextType>{});

export const useTwitarr = () => useContext(TwitarrContext);
