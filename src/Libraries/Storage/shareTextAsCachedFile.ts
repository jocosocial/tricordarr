import {File, Paths} from 'expo-file-system';
import Share from 'react-native-share';

export type ShareTextAsCachedFileResult = 'shared' | 'cancelled';

const isShareCancelled = (error: unknown) =>
  error instanceof Error && (/cancell?ed/i.test(error.message) || /did not share/i.test(error.message));

interface ShareTextAsCachedFileParams {
  /** Filename with extension, used as the cache file and share filename. */
  fileName: string;
  mimeType: string;
  contents: string;
}

/**
 * Writes text to a cache file and opens the system share sheet.
 * Cache is required so Android FileProvider can serve the file; documents-directory
 * URIs are not in that provider's paths and NPEs on getScheme().
 */
export const shareTextAsCachedFile = async ({
  fileName,
  mimeType,
  contents,
}: ShareTextAsCachedFileParams): Promise<ShareTextAsCachedFileResult> => {
  try {
    const shareFile = new File(Paths.cache, fileName);
    shareFile.create({intermediates: true, overwrite: true});
    shareFile.write(contents);
    const shareResult = await Share.open({
      url: shareFile.uri,
      type: mimeType,
      filename: fileName,
      failOnCancel: false,
    });
    if (shareResult.dismissedAction) {
      return 'cancelled';
    }
    return 'shared';
  } catch (error) {
    if (isShareCancelled(error)) {
      return 'cancelled';
    }
    throw error;
  }
};
