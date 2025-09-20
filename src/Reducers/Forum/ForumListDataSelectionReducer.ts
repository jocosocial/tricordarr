import {useReducer} from 'react';

import {ForumListData} from '#src/Structs/ControllerStructs';

export enum ForumListDataSelectionActions {
  select = 'SELECT',
  clear = 'CLEAR',
  set = 'SET',
  updateItem = 'UPDATE_ITEM',
}

export type ForumListDataSelectionActionsType =
  | {
      type: ForumListDataSelectionActions.select;
      forumListData: ForumListData;
    }
  | {type: ForumListDataSelectionActions.clear}
  | {type: ForumListDataSelectionActions.updateItem; item: ForumListData}
  | {type: ForumListDataSelectionActions.set; items: ForumListData[]};

const forumListDataSelectionReducer = (
  selectedItems: ForumListData[] = [],
  action: ForumListDataSelectionActionsType,
) => {
  switch (action.type) {
    case ForumListDataSelectionActions.select:
      const selected = selectedItems.some(i => i.forumID === action.forumListData.forumID);
      if (selected) {
        return selectedItems.filter(i => i.forumID !== action.forumListData.forumID);
      }
      return selectedItems.concat(action.forumListData);
    case ForumListDataSelectionActions.clear:
      return [];
    case ForumListDataSelectionActions.set:
      return action.items;
    case ForumListDataSelectionActions.updateItem:
      return selectedItems.map(i => {
        if (i.forumID === action.item.forumID) {
          return action.item;
        }
        return i;
      });
  }
};

export const useForumListDataSelectionReducer = (initialState: ForumListData[] = []) =>
  useReducer(forumListDataSelectionReducer, initialState);
