import {createContext, useContext} from 'react';

import {FezData, ForumListData, UserHeader} from '#src/Structs/ControllerStructs';
import {Selectable} from '#src/Types/Selectable';

export interface SelectableContextType {
  fromForumListData: (forumListData: ForumListData) => Selectable;
  fromFezData: (fezData: FezData) => Selectable;
  fromUserHeader: (userHeader: UserHeader) => Selectable;
}

export const SelectableContext = createContext(<SelectableContextType>{});

/**
 * Factory functions for building `Selectable` items from domain data. Provided as a
 * context (rather than a plain hook) so consumers get stable function references across
 * renders - see AppImageContext.ts for the full rationale.
 *
 * Not to be confused with SelectionContext, which holds the live selection UI state
 * (what's currently selected, whether selection mode is on) that these `Selectable`
 * items get dispatched into. This context has no state of its own - it just builds the
 * shape SelectionContext's dispatchSelectedItems expects.
 */
export const useSelectable = () => useContext(SelectableContext);
