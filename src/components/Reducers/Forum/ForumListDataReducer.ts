import {ForumData, ForumListData, UserHeader} from '../../../libraries/Structs/ControllerStructs';
import {useReducer} from 'react';

export enum ForumListDataActions {
  setList = 'SET',
  updateThread = 'UPDATE_THREAD',
  updateRelations = 'UPDATE_RELATIONS',
  prependNewForumData = 'PREPEND_NEW_FORUM_DATA',
  touch = 'TOUCH', // update and move to the top
  clear = 'CLEAR',
  markAsRead = 'MARK_AS_READ',
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
  | {type: ForumListDataActions.touch; thread: ForumListData}
  | {type: ForumListDataActions.clear}
  | {type: ForumListDataActions.markAsRead; forumID: string};

const forumDataReducer = (threadList: ForumListData[], action: ForumListDataActionsType): ForumListData[] => {
  console.log('[ForumListDataReducer.ts] Got action:', action.type);
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
    case ForumListDataActions.touch: {
      if (action.thread.forumID in threadList.filter(fld => fld.forumID)) {
        return [action.thread].concat(threadList.filter(fld => fld.forumID !== action.thread.forumID));
      }
      return threadList;
    }
    case ForumListDataActions.clear: {
      return [];
    }
    case ForumListDataActions.markAsRead: {
      return threadList.flatMap(thread => {
        if (thread.forumID === action.forumID) {
          thread.readCount = thread.postCount;
        }
        return thread;
      });
    }
    default: {
      throw new Error('Unknown ForumListDataActions action');
    }
  }
};

export const useForumListDataReducer = (initialState: ForumListData[]) => useReducer(forumDataReducer, initialState);
