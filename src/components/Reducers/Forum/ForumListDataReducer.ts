import {ForumData, ForumListData, UserHeader} from '../../../libraries/Structs/ControllerStructs';
import {useReducer} from 'react';
import {useUserData} from '../../Context/Contexts/UserDataContext';

export enum ForumListDataActions {
  setList = 'SET',
  updateThread = 'UPDATE_THREAD',
  updateRelations = 'UPDATE_RELATIONS',
  prependNewForumData = 'PREPEND_NEW_FORUM_DATA',
  upsert = 'UPSERT', // update and move to the top
  clear = 'CLEAR',
}

export type ForumListDataActionsType =
  | {type: ForumListDataActions.setList; threadList: ForumListData[]}
  | {type: ForumListDataActions.updateThread; newThread: ForumListData}
  | {type: ForumListDataActions.updateRelations; forumID: string; isFavorite: boolean; isMuted: boolean}
  | {
      type: ForumListDataActions.prependNewForumData;
      forumData: ForumData;
      createdAt: string;
      postCount: number;
      readCount: number;
      lastPostAt?: string;
      lastPoster?: UserHeader;
    }
  | {type: ForumListDataActions.upsert; thread: ForumListData}
  | {type: ForumListDataActions.clear};

const forumDataReducer = (threadList: ForumListData[], action: ForumListDataActionsType): ForumListData[] => {
  console.log('forumThreadListReducer got action', action.type);
  switch (action.type) {
    case ForumListDataActions.setList: {
      return action.threadList;
    }
    case ForumListDataActions.updateThread: {
      return threadList.flatMap(f => {
        if (f.forumID === action.newThread.forumID) {
          console.log('Updating Thread', f.forumID);
          return action.newThread;
        }
        return f;
      });
    }
    case ForumListDataActions.updateRelations: {
      return threadList.flatMap(f => {
        if (f.forumID === action.forumID) {
          return {
            ...f,
            isMuted: action.isMuted,
            isFavorite: action.isFavorite,
          };
        }
        return f;
      });
    }
    case ForumListDataActions.prependNewForumData: {
      const newListData: ForumListData = {
        ...action.forumData,
        createdAt: action.createdAt,
        postCount: action.postCount,
        readCount: action.readCount,
        lastPostAt: action.lastPostAt,
        lastPoster: action.lastPoster,
      };
      return [newListData].concat(threadList);
    }
    case ForumListDataActions.upsert: {
      return [action.thread].concat(threadList.filter(fld => fld.forumID !== action.thread.forumID));
    }
    case ForumListDataActions.clear: {
      return [];
    }
    default: {
      throw new Error('Unknown ForumListDataActions action');
    }
  }
};

export const useForumListDataReducer = (initialState: ForumListData[]) => useReducer(forumDataReducer, initialState);
