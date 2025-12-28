import React, {PropsWithChildren, useState} from 'react';

import {SelectionContext} from '#src/Context/Contexts/SelectionContext';
import {useSelectionReducer} from '#src/Reducers/SelectionReducer';

/**
 * Provider for selecting items in a list. This is intended to be used in a Screen
 * rather than globally in the App.tsx since what you're selecting varies.
 */
export const SelectionProvider = ({children}: PropsWithChildren) => {
  const [enableSelection, setEnableSelection] = useState<boolean>(false);
  const [selectedItems, dispatchSelectedItems] = useSelectionReducer([]);

  return (
    <SelectionContext.Provider value={{selectedItems, dispatchSelectedItems, enableSelection, setEnableSelection}}>
      {children}
    </SelectionContext.Provider>
  );
};
