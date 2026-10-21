import React, {PropsWithChildren, useEffect, useRef, useState} from 'react';
import {Vibration} from 'react-native';

import {SelectionContext} from '#src/Context/Contexts/SelectionContext';
import {useSelectionReducer} from '#src/Context/Reducers/SelectionReducer';
import {isAndroid} from '#src/Libraries/Platform/Detection';

/**
 * Provider for selecting items in a list. This is intended to be used in a Screen
 * rather than globally in the App.tsx since what you're selecting varies.
 *
 * Holds live selection UI state (what's currently selected, whether selection mode is
 * on) - not to be confused with SelectableProvider, which holds pure factory functions
 * for turning domain data (UserHeader, FezData, ForumListData) into the `Selectable`
 * shape this context's dispatch expects. Build the item with useSelectable(), then hand
 * it to this context's dispatchSelectedItems.
 */
export const SelectionProvider = ({children}: PropsWithChildren) => {
  const [enableSelection, setEnableSelection] = useState<boolean>(false);
  const [selectedItems, dispatchSelectedItems] = useSelectionReducer([]);
  const prevEnableSelectionRef = useRef<boolean>(false);

  useEffect(() => {
    // Trigger haptic feedback when enableSelection changes from false to true
    // iOS doesn't let you make this short and the default of 400ms is far too long.
    if (isAndroid && enableSelection && !prevEnableSelectionRef.current) {
      Vibration.vibrate(30);
    }
    prevEnableSelectionRef.current = enableSelection;
  }, [enableSelection]);

  return (
    <SelectionContext.Provider value={{selectedItems, dispatchSelectedItems, enableSelection, setEnableSelection}}>
      {children}
    </SelectionContext.Provider>
  );
};
