import {BottomSheetView} from '@gorhom/bottom-sheet';
import React, {createContext, PropsWithChildren, useCallback, useContext, useState} from 'react';
import {LayoutChangeEvent} from 'react-native';

import {AppSnackbar} from '#src/Components/Snackbars/AppSnackbar';
import {styleDefaults} from '#src/Context/Providers/StyleProvider';

/** Gorhom default handle: 10px padding + 4px indicator. Not included in BottomSheetView layout. */
const HANDLE_HEIGHT = 24;

const BottomSheetSnackbarOffsetContext = createContext<(height: number) => void>(() => {});

/**
 * BottomSheetView that reports its on-screen height (plus handle) so the portal
 * snackbar can sit above the sheet, matching ImageViewerSnackbar's footer offset.
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
 * Gorhom `containerComponent` so AppSnackbar renders in the same portal as the
 * sheet. Paper's Portal.Host sits below that overlay, which is why a snackbar
 * there is hidden by the sheet (same reason Lightbox owns ImageViewerSnackbar).
 * Offset is sheet height plus safe area and a small gap so the toast sits
 * clearly above the handle.
 */
export const BottomSheetSnackbarContainer = ({children}: PropsWithChildren) => {
  const [sheetHeight, setSheetHeight] = useState(0);
  const bottomOffset = sheetHeight + styleDefaults.marginSize * 1.5;

  return (
    <BottomSheetSnackbarOffsetContext.Provider value={setSheetHeight}>
      {children}
      <AppSnackbar overlay bottomOffset={bottomOffset} />
    </BottomSheetSnackbarOffsetContext.Provider>
  );
};
