import {useReducer} from 'react';

import {Selectable} from '#src/Types/Selectable';

export enum SelectionActions {
  select = 'SELECT',
  clear = 'CLEAR',
  set = 'SET',
}

export type SelectionActionsType =
  | {
      type: SelectionActions.select;
      item: Selectable;
    }
  | {type: SelectionActions.clear}
  | {type: SelectionActions.set; items: Selectable[]};

const selectionReducer = (selectedItems: Selectable[] = [], action: SelectionActionsType) => {
  switch (action.type) {
    case SelectionActions.select:
      const selected = selectedItems.some(i => i.id === action.item.id);
      if (selected) {
        return selectedItems.filter(i => i.id !== action.item.id);
      }
      return selectedItems.concat(action.item);
    case SelectionActions.clear:
      return [];
    case SelectionActions.set:
      return action.items;
  }
};

export const useSelectionReducer = (initialState: Selectable[] = []) => useReducer(selectionReducer, initialState);
