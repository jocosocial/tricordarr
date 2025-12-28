import {createContext, Dispatch, SetStateAction, useContext} from 'react';

import {SelectionActionsType} from '#src/Reducers/SelectionReducer';
import {Selectable} from '#src/Types/Selection';

export interface SelectionContextType {
  selectedItems: Selectable[];
  dispatchSelectedItems: Dispatch<SelectionActionsType>;
  enableSelection: boolean;
  setEnableSelection: Dispatch<SetStateAction<boolean>>;
}

export const SelectionContext = createContext(<SelectionContextType>{});

export const useSelection = () => useContext(SelectionContext);
