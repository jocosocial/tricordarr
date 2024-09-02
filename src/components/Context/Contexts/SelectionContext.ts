import {Context, createContext, Dispatch, SetStateAction, useContext} from 'react';

export interface SelectionContextType<TItem> {
  selectedItems: TItem[];
  setSelectedItems: Dispatch<SetStateAction<TItem[]>>;
  enableSelection: boolean;
  setEnableSelection: Dispatch<SetStateAction<boolean>>;
}

export const SelectionContext = createContext<SelectionContextType<unknown>>({} as SelectionContextType<unknown>);

export const useSelection = <TItem>() =>
  useContext<SelectionContextType<TItem>>(SelectionContext as Context<SelectionContextType<TItem>>);
