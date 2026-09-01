import {Directory} from 'expo-file-system';
import {StorageAccessFramework} from 'expo-file-system/legacy';

import {isAndroid} from '#src/Libraries/Platform/Detection';

export type SaveToPickedDirectoryResult = 'saved' | 'cancelled';

const isPickerCancelled = (error: unknown) => error instanceof Error && /cancell?ed/i.test(error.message);

interface SaveTextToPickedDirectoryParams {
  /** Filename without extension; the mime type determines the extension. */
  baseName: string;
  mimeType: string;
  contents: string;
}

/**
 * Prompts the user to pick a folder and writes a text file there.
 * Android uses the legacy Storage Access Framework because Directory.createFile
 * NPEs on SAF URIs from pickDirectoryAsync.
 */
export const saveTextToPickedDirectory = async ({
  baseName,
  mimeType,
  contents,
}: SaveTextToPickedDirectoryParams): Promise<SaveToPickedDirectoryResult> => {
  try {
    // Directory.createFile NPEs on Android SAF URIs from pickDirectoryAsync.
    // The legacy Storage Access Framework APIs are reliable here.
    if (isAndroid) {
      const permissions = await StorageAccessFramework.requestDirectoryPermissionsAsync();
      if (!permissions.granted) {
        return 'cancelled';
      }
      const destUri = await StorageAccessFramework.createFileAsync(permissions.directoryUri, baseName, mimeType);
      await StorageAccessFramework.writeAsStringAsync(destUri, contents);
    } else {
      const directory = await Directory.pickDirectoryAsync();
      const destFile = directory.createFile(baseName, mimeType);
      destFile.write(contents);
    }
    return 'saved';
  } catch (error) {
    if (isPickerCancelled(error)) {
      return 'cancelled';
    }
    throw error;
  }
};
