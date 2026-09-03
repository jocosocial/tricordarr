import React, {PropsWithChildren, useCallback, useMemo, useState} from 'react';

import {ShareBottomSheet} from '#src/Components/Sheets/ShareBottomSheet';
import {ShareSheetContext} from '#src/Context/Contexts/ShareSheetContext';
import {ShareContentType} from '#src/Libraries/Sharing';

/**
 * Owns a single share bottom sheet so it stays mounted when Paper menus unmount their children.
 * Must render inside BottomSheetModalProvider (see BottomSheetProvider).
 */
export const ShareSheetProvider = ({children}: PropsWithChildren) => {
  const [contentType, setContentType] = useState<ShareContentType | undefined>();
  const [contentID, setContentID] = useState<string | number | undefined>();
  const [isPresented, setIsPresented] = useState(false);

  const openShareSheet = useCallback((type: ShareContentType, id: string | number) => {
    setContentType(type);
    setContentID(id);
    setIsPresented(true);
  }, []);

  const closeShareSheet = useCallback(() => {
    setIsPresented(false);
  }, []);

  const contextValue = useMemo(
    () => ({
      openShareSheet,
      closeShareSheet,
    }),
    [openShareSheet, closeShareSheet],
  );

  return (
    <ShareSheetContext.Provider value={contextValue}>
      {children}
      <ShareBottomSheet
        contentType={contentType}
        contentID={contentID}
        isPresented={isPresented && contentType !== undefined && String(contentID ?? '').length > 0}
        onDismiss={closeShareSheet}
      />
    </ShareSheetContext.Provider>
  );
};
