import React, {PropsWithChildren} from 'react';

import {SelectableContext, SelectableContextType} from '#src/Context/Contexts/SelectableContext';
import {FezData, ForumListData, UserHeader} from '#src/Structs/ControllerStructs';
import {Selectable} from '#src/Types/Selectable';

const fromForumListData = (forumListData: ForumListData): Selectable => {
  return {
    id: forumListData.forumID,
  };
};

const fromFezData = (fezData: FezData): Selectable => {
  return {
    id: fezData.fezID,
  };
};

const fromUserHeader = (userHeader: UserHeader): Selectable => {
  return {
    id: userHeader.userID,
  };
};

const selectableContextValue: SelectableContextType = {fromForumListData, fromFezData, fromUserHeader};

/**
 * Provides pure factory functions for building `Selectable` items from domain data.
 * Distinct from SelectionProvider, which owns the live selection UI state - this
 * provider has no state of its own, it just constructs the shape SelectionContext's
 * dispatchSelectedItems expects.
 */
export const SelectableProvider = ({children}: PropsWithChildren) => {
  return <SelectableContext.Provider value={selectableContextValue}>{children}</SelectableContext.Provider>;
};
