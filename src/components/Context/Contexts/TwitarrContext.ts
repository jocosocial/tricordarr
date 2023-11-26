import {useContext, createContext, Dispatch, SetStateAction} from 'react';
import {
  CategoryData,
  EventData,
  FezData,
  FezPostData,
  ForumListData,
} from '../../../libraries/Structs/ControllerStructs';
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
  openWebUrl: (url: string) => void;
  forumCategories: CategoryData[];
  setForumCategories: Dispatch<SetStateAction<CategoryData[]>>;
  forumThreads: ForumListData[];
  setForumThreads: Dispatch<SetStateAction<ForumListData[]>>;
}

export const TwitarrContext = createContext(<TwitarrContextType>{});

export const useTwitarr = () => useContext(TwitarrContext);
