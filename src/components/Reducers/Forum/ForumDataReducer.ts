import {ForumData} from '../../../libraries/Structs/ControllerStructs';
import {useReducer} from 'react';

export enum ForumDataActions {
  setList = 'SET',
  updateThread = 'UPDATE_THREAD',
}

export type ForumDataActionsType =
  | {type: ForumDataActions.setList; threadList: ForumData[]}
  | {type: ForumDataActions.updateThread; newThread: ForumData};

const forumDataReducer = (threadList: ForumData[], action: ForumDataActionsType): ForumData[] => {
  console.log('forumThreadListReducer got action', action.type);
  switch (action.type) {
    case ForumDataActions.setList: {
      return action.threadList;
    }
    case ForumDataActions.updateThread: {
      return threadList.flatMap(f => {
        if (f.forumID === action.newThread.forumID) {
          console.log('Updating Thread', f.forumID);
          return action.newThread;
        }
        return f;
      });
    }
    default: {
      throw new Error('Unknown ForumDataActions action');
    }
  }
};

export const useForumDataReducer = (initialState: ForumData[]) => useReducer(forumDataReducer, initialState);
