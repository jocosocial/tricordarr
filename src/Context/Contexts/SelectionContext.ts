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

export const useSelection = () => useContext(SelectionContext);
