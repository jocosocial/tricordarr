import {useContext, createContext, Dispatch, SetStateAction} from 'react';
import {FezData, FezPostData, ForumData, ForumListData, PostData} from '../../../libraries/Structs/ControllerStructs';
import {FezListActionsType} from '../../Reducers/Fez/FezListReducers';
import {FezPostsActionsType} from '../../Reducers/Fez/FezPostsReducers';
import {ForumPostListActionsType} from '../../Reducers/Forum/ForumPostListReducer';
import {ForumListDataActionsType} from '../../Reducers/Forum/ForumListDataReducer';

interface TwitarrContextType {
  fez?: FezData;
  setFez: Dispatch<SetStateAction<FezData | undefined>>;
  fezList: FezData[];
  dispatchFezList: Dispatch<FezListActionsType>;
  fezPostsData: FezPostData[];
  dispatchFezPostsData: Dispatch<FezPostsActionsType>;
  searchString: string;
  setSearchString: Dispatch<SetStateAction<string>>;
  lfgList: FezData[];
  dispatchLfgList: Dispatch<FezListActionsType>;
  lfg?: FezData;
  setLfg: Dispatch<SetStateAction<FezData | undefined>>;
  lfgPostsData: FezPostData[];
  dispatchLfgPostsData: Dispatch<FezPostsActionsType>;
  openWebUrl: (url: string) => void;
  forumData: ForumData | undefined;
  setForumData: Dispatch<SetStateAction<ForumData | undefined>>;
  forumListData: ForumListData[];
  dispatchForumListData: Dispatch<ForumListDataActionsType>;
  forumPosts: PostData[];
  dispatchForumPosts: Dispatch<ForumPostListActionsType>;
}

export const TwitarrContext = createContext(<TwitarrContextType>{});

export const useTwitarr = () => useContext(TwitarrContext);
