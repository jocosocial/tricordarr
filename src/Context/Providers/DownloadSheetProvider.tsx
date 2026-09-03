import React, {PropsWithChildren, useCallback, useMemo, useState} from 'react';

import {DownloadBottomSheet} from '#src/Components/Sheets/DownloadBottomSheet';
import {DownloadSheetContext} from '#src/Context/Contexts/DownloadSheetContext';
import {DownloadSheetContent} from '#src/Libraries/Download';

/**
 * Owns a single download bottom sheet so it stays mounted when Paper menus unmount their children.
 * Must render inside BottomSheetModalProvider (see BottomSheetProvider).
 */
export const DownloadSheetProvider = ({children}: PropsWithChildren) => {
  const [content, setContent] = useState<DownloadSheetContent | undefined>();
  const [isPresented, setIsPresented] = useState(false);

  const openDownloadSheet = useCallback((payload: DownloadSheetContent) => {
    setContent(payload);
    setIsPresented(true);
  }, []);

  const closeDownloadSheet = useCallback(() => {
    setIsPresented(false);
  }, []);

  const contextValue = useMemo(
    () => ({
      openDownloadSheet,
      closeDownloadSheet,
    }),
    [openDownloadSheet, closeDownloadSheet],
  );

  return (
    <DownloadSheetContext.Provider value={contextValue}>
      {children}
      <DownloadBottomSheet
        content={content}
        isPresented={isPresented && content !== undefined}
        onDismiss={closeDownloadSheet}
      />
    </DownloadSheetContext.Provider>
  );
};
