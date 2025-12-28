import React, {PropsWithChildren, useState} from 'react';

import {SelectionContext} from '#src/Context/Contexts/SelectionContext';
import {useSelectionReducer} from '#src/Reducers/SelectionReducer';

export const SelectionProvider = ({children}: PropsWithChildren) => {
  const [enableSelection, setEnableSelection] = useState<boolean>(false);
  const [selectedItems, dispatchSelectedItems] = useSelectionReducer([]);

  return (
    <SelectionContext.Provider value={{selectedItems, dispatchSelectedItems, enableSelection, setEnableSelection}}>
      {children}
    </SelectionContext.Provider>
  );
};
