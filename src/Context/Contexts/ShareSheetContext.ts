import {createContext, useContext} from 'react';

import {ShareContentType} from '#src/Libraries/Sharing';

export interface ShareSheetContextType {
  /**
   * Present the share bottom sheet for the given content type and ID.
   * contentText, when provided, is combined with the share link when sharing to other apps.
   */
  openShareSheet: (contentType: ShareContentType, contentID: string | number, contentText?: string) => void;
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
