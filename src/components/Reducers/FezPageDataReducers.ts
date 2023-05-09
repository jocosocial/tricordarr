import {useReducer} from 'react';
import {InfiniteData} from '@tanstack/react-query';
import {FezData, FezPostData} from '../../libraries/Structs/ControllerStructs';

export enum FezPageDataActions {
  appendPost = 'APPEND_POST',
  set = 'SET',
}

export type FezPageDataActionsType =
  | {type: FezPageDataActions.set; data: InfiniteData<FezData> | undefined}
  | {type: FezPageDataActions.appendPost; fezPostData: FezPostData};

const fezPageDataActionsReducer = (fezData: InfiniteData<FezData> | undefined, action: FezPageDataActionsType) => {
  console.log('fezActionsReducer Action:', action.type);
  if (action.type === FezPageDataActions.set) {
    return action.data;
  }
  if (fezData) {
    switch (action.type) {
      case FezPageDataActions.appendPost: {
        const data = fezData;
        console.log('reducer appending', action.fezPostData);
        data.pages[data.pages.length - 1].members?.posts?.push(action.fezPostData);
        data.pages.map((p, i) => console.log('Page', i, p.members?.posts));
        console.log('reducer returning', data.pages);
        return data;
      }
      default: {
        throw new Error('Unknown FezAction action');
      }
    }
  }
};

export const useFezPageDataReducer = (initialState?: InfiniteData<FezData> | undefined) =>
  useReducer(fezPageDataActionsReducer, initialState);
