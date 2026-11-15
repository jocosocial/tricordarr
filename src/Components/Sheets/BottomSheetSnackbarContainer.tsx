import {BottomSheetView} from '@gorhom/bottom-sheet';
import React, {createContext, PropsWithChildren, useCallback, useContext, useState} from 'react';
import {LayoutChangeEvent} from 'react-native';

import {AppSnackbar} from '#src/Components/Snackbars/AppSnackbar';
import {styleDefaults} from '#src/Context/Providers/StyleProvider';

/** Gorhom default handle: 10px padding + 4px indicator. Not included in BottomSheetView layout. */
const HANDLE_HEIGHT = 24;

const BottomSheetSnackbarOffsetContext = createContext<(height: number) => void>(() => {});

/**
 * BottomSheetView that reports its on-screen height (plus handle) so the sheet's
 * snackbar can sit above it, matching ImageViewerSnackbar's footer offset.
 */
export const MeasuredBottomSheetView = ({children}: PropsWithChildren) => {
  const setSheetHeight = useContext(BottomSheetSnackbarOffsetContext);

  const handleLayout = useCallback(
    (event: LayoutChangeEvent) => {
      setSheetHeight(event.nativeEvent.layout.height + HANDLE_HEIGHT);
    },
    [setSheetHeight],
  );

  return <BottomSheetView onLayout={handleLayout}>{children}</BottomSheetView>;
};

/**
 * Gorhom `containerComponent` so AppSnackbar renders in the same overlay as the
 * sheet. The screen's own snackbar lives inline in AppView, underneath the sheet
 * overlay, which is why one is needed here (same reason Lightbox owns
 * ImageViewerSnackbar). Offset is sheet height plus a small gap so the toast
 * sits clearly above the handle; the sheet already covers the bottom inset.
 */
export const BottomSheetSnackbarContainer = ({children}: PropsWithChildren) => {
  const [sheetHeight, setSheetHeight] = useState(0);
  const bottomOffset = sheetHeight + styleDefaults.marginSize * 1.5;

  return (
    <BottomSheetSnackbarOffsetContext.Provider value={setSheetHeight}>
      {children}
      <AppSnackbar ignoreBottomInset bottomOffset={bottomOffset} />
    </BottomSheetSnackbarOffsetContext.Provider>
  );
};
