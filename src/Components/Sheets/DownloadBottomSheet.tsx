import React, {useState} from 'react';
import Share from 'react-native-share';

import {AppBottomSheet} from '#src/Components/Sheets/AppBottomSheet';
import {AppBottomSheetButton} from '#src/Components/Sheets/AppBottomSheetButton';
import {useSnackbar} from '#src/Context/Contexts/SnackbarContext';
import {AppIcons} from '#src/Enums/Icons';
import {useClipboard} from '#src/Hooks/useClipboard';
import {DownloadSheetContent, getDownloadFileName, getDownloadSheetTitle} from '#src/Libraries/Download';
import {saveTextToPickedDirectory} from '#src/Libraries/Storage/saveTextToPickedDirectory';
import {shareTextAsCachedFile} from '#src/Libraries/Storage/shareTextAsCachedFile';

interface DownloadBottomSheetProps {
  content?: DownloadSheetContent;
  isPresented: boolean;
  onDismiss: () => void;
}

/**
 * Download sheet with save-to-folder and system-share actions for a text file.
 * In 'text' mode (content.mode === 'text') there is no Save to Folder option, and
 * Share to Apps shares the raw text directly instead of as a file attachment.
 */
export const DownloadBottomSheet = ({content, isPresented, onDismiss}: DownloadBottomSheetProps) => {
  const {setSnackbarPayload, snackbarTry} = useSnackbar();
  const {setString} = useClipboard();
  const [isSaving, setIsSaving] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const isBusy = isSaving || isSharing;
  const isTextMode = content?.mode === 'text';

  /**
   * Prompts for a folder and writes the file. Stays open if the picker is cancelled.
   */
  const handleSave = snackbarTry(async () => {
    if (!content || !content.baseName) {
      return;
    }
    setIsSaving(true);
    try {
      const result = await saveTextToPickedDirectory({
        baseName: content.baseName,
        mimeType: content.mimeType,
        contents: content.contents,
      });
      if (result === 'cancelled') {
        return;
      }
      setSnackbarPayload({message: 'File saved.', messageType: 'success'});
    } finally {
      setIsSaving(false);
    }
  });

  /**
   * Opens the system share sheet. In 'text' mode this shares the raw text directly
   * (no file involved); otherwise it shares the content as a file attachment.
   */
  const handleShare = snackbarTry(async () => {
    if (!content) {
      return;
    }
    setIsSharing(true);
    try {
      if (isTextMode) {
        await Share.open({message: content.contents, failOnCancel: false});
        return;
      }
      await shareTextAsCachedFile({
        fileName: getDownloadFileName(content),
        mimeType: content.mimeType,
        contents: content.contents,
      });
    } finally {
      setIsSharing(false);
    }
  });

  /**
   * Copies the raw contents to the clipboard. The sheet stays open so further actions remain available.
   */
  const handleCopy = snackbarTry(() => {
    if (!content) {
      return;
    }
    setString(content.contents);
  });

  return (
    <AppBottomSheet
      title={getDownloadSheetTitle(content)}
      isPresented={isPresented}
      onDismiss={onDismiss}
      // Text mode omits Save to Folder.
      buttonCount={isTextMode ? 2 : 3}>
      {!isTextMode && (
        <AppBottomSheetButton
          buttonText={'Save to Folder'}
          onPress={handleSave}
          icon={AppIcons.download}
          testID={'downloadSave-button'}
          disabled={isBusy}
          isLoading={isSaving}
        />
      )}
      <AppBottomSheetButton
        buttonText={'Share to Apps'}
        onPress={handleShare}
        icon={AppIcons.share}
        testID={'downloadShare-button'}
        disabled={isBusy}
        isLoading={isSharing}
      />
      <AppBottomSheetButton
        buttonText={'Copy to Clipboard'}
        onPress={handleCopy}
        icon={AppIcons.copy}
        testID={'downloadCopy-button'}
        disabled={isBusy}
      />
    </AppBottomSheet>
  );
};
