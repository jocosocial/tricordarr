import {createContext, useContext} from 'react';

import {DownloadSheetContent} from '#src/Libraries/Download';

export interface DownloadSheetContextType {
  /**
   * Present the download bottom sheet for the given file contents.
   */
  openDownloadSheet: (content: DownloadSheetContent) => void;
  /**
   * Dismiss the download bottom sheet.
   */
  closeDownloadSheet: () => void;
}

export const DownloadSheetContext = createContext<DownloadSheetContextType>({
  openDownloadSheet: () => {},
  closeDownloadSheet: () => {},
});

export const useDownloadSheet = () => useContext(DownloadSheetContext);
