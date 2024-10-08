import {createContext, Dispatch, SetStateAction, useContext} from 'react';
import {ForumListData} from '../../../libraries/Structs/ControllerStructs.tsx';
import {ForumListDataSelectionActionsType} from '../../Reducers/Forum/ForumListDataSelectionReducer.ts';

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
