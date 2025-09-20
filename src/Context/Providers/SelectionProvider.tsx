import React from 'react';
import {PropsWithChildren, useState} from 'react';
import {SelectionContext} from '#src/Context/Contexts/SelectionContext.ts';
import {useForumListDataSelectionReducer} from '#src/Reducers/Forum/ForumListDataSelectionReducer.ts';

export const SelectionProvider = ({children}: PropsWithChildren) => {
  // const [selectedItems, setSelectedItems] = useState<unknown[]>([]);
  const [enableSelection, setEnableSelection] = useState<boolean>(false);
  const [selectedForums, dispatchSelectedForums] = useForumListDataSelectionReducer([]);

  return (
    <SelectionContext.Provider value={{selectedForums, dispatchSelectedForums, enableSelection, setEnableSelection}}>
      {children}
    </SelectionContext.Provider>
  );
};
