import {BottomSheetModalProvider} from '@gorhom/bottom-sheet';
import {PropsWithChildren} from 'react';

import {DownloadSheetProvider} from '#src/Context/Providers/DownloadSheetProvider';
import {ShareSheetProvider} from '#src/Context/Providers/ShareSheetProvider';

/**
 * Owns Gorhom's BottomSheetModalProvider and the share/download sheet contexts
 * so both sheets stay mounted when Paper menus unmount their children.
 */
export const BottomSheetProvider = ({children}: PropsWithChildren) => {
  return (
    <BottomSheetModalProvider>
      <ShareSheetProvider>
        <DownloadSheetProvider>{children}</DownloadSheetProvider>
      </ShareSheetProvider>
    </BottomSheetModalProvider>
  );
};
