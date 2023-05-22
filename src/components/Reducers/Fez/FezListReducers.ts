import {useReducer} from 'react';
import {FezData} from '../../../libraries/Structs/ControllerStructs';

export enum FezListActions {
  markAsRead = 'MARK_AS_READ',
  incrementPostCount = 'INCREMENT_POST_COUNT',
  moveToTop = 'MOVE_TO_TOP',
  set = 'SET',
  updateFez = 'UPDATE_FEZ',
  insert = 'INSERT',
  addSelfPost = 'ADD_SELF_POST',
}

export type FezListActionsType =
  | {type: FezListActions.markAsRead; fezID: string}
  | {type: FezListActions.incrementPostCount; fezID: string}
  | {type: FezListActions.moveToTop; fezID: string}
  | {type: FezListActions.updateFez; fez: FezData}
  | {type: FezListActions.set; fezList: FezData[]}
  | {type: FezListActions.insert; fez: FezData}
  | {type: FezListActions.addSelfPost; fezID: string};

const fezListReducer = (fezList: FezData[], action: FezListActionsType): FezData[] => {
  console.log('fezListReducer Action:', action.type);
  if (action.type === FezListActions.set) {
    return action.fezList;
  }
  switch (action.type) {
    case FezListActions.markAsRead: {
      return fezList.flatMap(f => {
        if (f.fezID === action.fezID && f.members) {
          f.members.readCount = f.members.postCount;
        }
        return f;
      });
    }
    case FezListActions.incrementPostCount: {
      return fezList.flatMap(f => {
        if (f.fezID === action.fezID && f.members) {
          f.members.postCount = f.members.postCount + 1;
          f.lastModificationTime = new Date();
        }
        return f;
      });
    }
    case FezListActions.moveToTop: {
      const currentIndex = fezList.findIndex((f: FezData) => f.fezID === action.fezID);
      if (currentIndex === -1) {
        return fezList;
      }
      const currentFez = fezList[currentIndex];
      const newFezzes = [...fezList.slice(0, currentIndex), ...fezList.slice(currentIndex + 1)];
      newFezzes.unshift(currentFez);
      return newFezzes;
    }
    case FezListActions.updateFez: {
      return fezList.flatMap(f => {
        if (f.fezID === action.fez.fezID) {
          return action.fez;
        }
        return f;
      });
    }
    case FezListActions.insert: {
      return [action.fez].concat(fezList);
    }
    case FezListActions.addSelfPost: {
      return fezList.flatMap(f => {
        if (f.fezID === action.fezID && f.members) {
          f.members.postCount = f.members.postCount + 1;
          f.members.readCount = f.members.readCount + 1;
          f.lastModificationTime = new Date();
        }
        return f;
      });
    }
    default: {
      throw new Error('Unknown FezListAction action');
    }
  }
};

export const useFezListReducer = (initialState: FezData[]) => useReducer(fezListReducer, initialState);
