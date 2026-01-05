import React, {PropsWithChildren, useEffect, useRef, useState} from 'react';
import {Vibration} from 'react-native';

import {SelectionContext} from '#src/Context/Contexts/SelectionContext';
import {useSelectionReducer} from '#src/Context/Reducers/SelectionReducer';

/**
 * Provider for selecting items in a list. This is intended to be used in a Screen
 * rather than globally in the App.tsx since what you're selecting varies.
 */
export const SelectionProvider = ({children}: PropsWithChildren) => {
  const [enableSelection, setEnableSelection] = useState<boolean>(false);
  const [selectedItems, dispatchSelectedItems] = useSelectionReducer([]);
  const prevEnableSelectionRef = useRef<boolean>(false);

  useEffect(() => {
    // Trigger haptic feedback when enableSelection changes from false to true
    if (enableSelection && !prevEnableSelectionRef.current) {
      Vibration.vibrate(50); // Short haptic feedback (50ms)
    }
    prevEnableSelectionRef.current = enableSelection;
  }, [enableSelection]);

  return (
    <SelectionContext.Provider value={{selectedItems, dispatchSelectedItems, enableSelection, setEnableSelection}}>
      {children}
    </SelectionContext.Provider>
  );
};
