import React from 'react';
import {PropsWithChildren, useState} from 'react';
import {SelectionContext} from '../Contexts/SelectionContext.ts';

export const SelectionProvider = ({children}: PropsWithChildren) => {
  const [selectedItems, setSelectedItems] = useState<unknown[]>([]);
  const [enableSelection, setEnableSelection] = useState<boolean>(false);

  return (
    <SelectionContext.Provider value={{selectedItems, setSelectedItems, enableSelection, setEnableSelection}}>
      {children}
    </SelectionContext.Provider>
  );
};
