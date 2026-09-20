import {createContext, Dispatch, SetStateAction, useContext} from 'react';

import {SelectionActionsType} from '#src/Context/Reducers/SelectionReducer';
import {Selectable} from '#src/Types/Selectable';

export interface SelectionContextType {
  selectedItems: Selectable[];
  dispatchSelectedItems: Dispatch<SelectionActionsType>;
  enableSelection: boolean;
  setEnableSelection: Dispatch<SetStateAction<boolean>>;
}

export const SelectionContext = createContext(<SelectionContextType>{
  selectedItems: [],
  dispatchSelectedItems: () => {},
  enableSelection: false,
  setEnableSelection: () => {},
});

/**
 * Live selection UI state - not to be confused with SelectableContext, which holds pure
 * factory functions for turning domain data into the `Selectable` shape this context's
 * dispatchSelectedItems expects. See SelectionProvider.tsx for the full distinction.
 */
export const useSelection = () => useContext(SelectionContext);
