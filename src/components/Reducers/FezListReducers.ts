import {useReducer} from 'react';
import {FezData, FezListData} from '../../libraries/Structs/ControllerStructs';

export enum FezListActions {
  markAsRead = 'MARK_AS_READ',
  incrementPostCount = 'INCREMENT_POST_COUNT',
  moveToTop = 'MOVE_TO_TOP',
  set = 'SET',
}

export type FezListActionsType =
  | {type: FezListActions.markAsRead; fezID: string}
  | {type: FezListActions.incrementPostCount; fezID: string}
  | {type: FezListActions.moveToTop; fezID: string}
  | {type: FezListActions.set; fezListData?: FezListData};

const fezListReducer = (fezListData: FezListData | undefined, action: FezListActionsType): FezListData | undefined => {
  console.log('fezListReducer Action:', action.type);
  if (action.type === FezListActions.set) {
    return action.fezListData;
  }
  if (fezListData) {
    switch (action.type) {
      case FezListActions.markAsRead: {
        const newFezzes = fezListData.fezzes.flatMap(f => {
          if (f.fezID === action.fezID && f.members) {
            f.members.readCount = f.members.postCount;
          }
          return f;
        });
        return {
          ...fezListData,
          fezzes: newFezzes,
        };
      }
      case FezListActions.incrementPostCount: {
        const newFezzes = fezListData.fezzes.flatMap(f => {
          if (f.fezID === action.fezID && f.members) {
            f.members.postCount = f.members.postCount + 1;
            f.lastModificationTime = new Date();
          }
          return f;
        });
        return {
          ...fezListData,
          fezzes: newFezzes,
        };
      }
      case FezListActions.moveToTop: {
        const currentIndex = fezListData.fezzes.findIndex((f: FezData) => f.fezID === action.fezID);
        if (currentIndex === -1) {
          return fezListData;
        }
        const currentFez = fezListData.fezzes[currentIndex];
        const newFezzes = [...fezListData.fezzes.slice(0, currentIndex), ...fezListData.fezzes.slice(currentIndex + 1)];
        newFezzes.unshift(currentFez);
        return {
          ...fezListData,
          fezzes: newFezzes,
        };
      }
      default: {
        throw new Error('Unknown FezListAction action');
      }
    }
  }
};

export const useFezListReducer = (initialState?: FezListData | undefined) => useReducer(fezListReducer, initialState);
