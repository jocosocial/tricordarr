import {ForumListData} from '../../../libraries/Structs/ControllerStructs';
import {useReducer} from 'react';

export enum ForumListDataActions {
  setList = 'SET',
  updateThread = 'UPDATE_THREAD',
}

export type ForumListDataActionsType =
  | {type: ForumListDataActions.setList; threadList: ForumListData[]}
  | {type: ForumListDataActions.updateThread; newThread: ForumListData};

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
    default: {
      throw new Error('Unknown ForumListDataActions action');
    }
  }
};

export const useForumListDataReducer = (initialState: ForumListData[]) => useReducer(forumDataReducer, initialState);