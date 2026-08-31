import {createContext, useContext} from 'react';

import {ShareContentType} from '#src/Libraries/Sharing';

export interface ShareSheetContextType {
  /**
   * Present the share bottom sheet for the given content type and ID.
   */
  openShareSheet: (contentType: ShareContentType, contentID: string | number) => void;
  /**
   * Dismiss the share bottom sheet.
   */
  closeShareSheet: () => void;
}

export const ShareSheetContext = createContext<ShareSheetContextType>({
  openShareSheet: () => {},
  closeShareSheet: () => {},
});

export const useShareSheet = () => useContext(ShareSheetContext);
