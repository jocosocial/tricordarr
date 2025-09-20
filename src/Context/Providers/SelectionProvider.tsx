import React from 'react';
import {PropsWithChildren, useState} from 'react';
import {SelectionContext} from '#src/Context/Contexts/SelectionContext';
import {useForumListDataSelectionReducer} from '#src/Reducers/Forum/ForumListDataSelectionReducer';

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
