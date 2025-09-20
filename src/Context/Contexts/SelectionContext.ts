import {createContext, Dispatch, SetStateAction, useContext} from 'react';

import {ForumListDataSelectionActionsType} from '#src/Reducers/Forum/ForumListDataSelectionReducer';
import {ForumListData} from '#src/Structs/ControllerStructs';

export interface SelectionContextType {
  // selectedItems: TItem[];
  // setSelectedItems: Dispatch<SetStateAction<TItem[]>>;
  selectedForums: ForumListData[];
  dispatchSelectedForums: Dispatch<ForumListDataSelectionActionsType>;
  enableSelection: boolean;
  setEnableSelection: Dispatch<SetStateAction<boolean>>;
}

export const SelectionContext = createContext(<SelectionContextType>{});

export const useSelection = () => useContext(SelectionContext);
