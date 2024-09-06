import React from 'react';
import {PropsWithChildren, useState} from 'react';
import {SelectionContext} from '../Contexts/SelectionContext.ts';
import {useForumListDataSelectionReducer} from '../../Reducers/Forum/ForumListDataSelectionReducer.ts';

export const SelectionProvider = ({children}: PropsWithChildren) => {
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [enableSelection, setEnableSelection] = useState<boolean>(false);
  const [selectedForums, dispatchSelectedForums] = useForumListDataSelectionReducer([]);

  return (
    <SelectionContext.Provider
      value={{
        selectedForums,
        dispatchSelectedForums,
        enableSelection,
        setEnableSelection,
        selectedItems,
        setSelectedItems,
      }}>
      {children}
    </SelectionContext.Provider>
  );
};
