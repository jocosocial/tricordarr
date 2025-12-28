import {createContext, Dispatch, SetStateAction, useContext} from 'react';

import {ForumListDataSelectionActionsType} from '#src/Reducers/Forum/ForumListDataSelectionReducer';
import {ForumListData} from '#src/Structs/ControllerStructs';

export interface SelectionContextType {
  selectedItems: ForumListData[];
  dispatchSelectedItems: Dispatch<ForumListDataSelectionActionsType>;
  enableSelection: boolean;
  setEnableSelection: Dispatch<SetStateAction<boolean>>;
}

export const SelectionContext = createContext(<SelectionContextType>{});

export const useSelection = () => useContext(SelectionContext);
