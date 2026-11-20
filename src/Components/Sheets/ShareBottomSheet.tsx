import React, {useCallback, useState} from 'react';

import {ShareQRCode, shareQrSize} from '#src/Components/QRCodes/ShareQRCode';
import {AppBottomSheet, bottomSheetItemGap} from '#src/Components/Sheets/AppBottomSheet';
import {AppBottomSheetButton} from '#src/Components/Sheets/AppBottomSheetButton';
import {useSnackbar} from '#src/Context/Contexts/SnackbarContext';
import {useSwiftarrQueryClient} from '#src/Context/Contexts/SwiftarrQueryClientContext';
import {AppIcons} from '#src/Enums/Icons';
import {useClipboard} from '#src/Hooks/useClipboard';
import {openInBrowser} from '#src/Libraries/Browser';
import {shareLinkToApps} from '#src/Libraries/ShareToApps';
import {getShareLink, getShareSheetTitle, ShareContentType} from '#src/Libraries/Sharing';

interface ShareBottomSheetProps {
  contentType?: ShareContentType;
  contentID?: string | number;
  contentText?: string;
  isPresented: boolean;
  onDismiss: () => void;
}

/**
 * Share sheet with copy, browser, and optional QR actions for the content URL.
 * Every action uses the public web URL.
 */
export const ShareBottomSheet = ({
  contentType,
  contentID,
  contentText,
  isPresented,
  onDismiss,
}: ShareBottomSheetProps) => {
  const [showQr, setShowQr] = useState(false);
  const {setString} = useClipboard();
  const {snackbarTry} = useSnackbar();
  const {serverUrl} = useSwiftarrQueryClient();
  const hasContent = contentType !== undefined && contentID !== undefined;
  const webUrl = hasContent ? getShareLink({serverUrl, contentType, contentID}) : '';

  // The QR, when it's showing. The sheet re-snaps to fit.
  const extraHeight = showQr ? shareQrSize + bottomSheetItemGap : 0;

  /**
   * Reset QR only when Gorhom actually closes, then notify the provider. Next present starts compact.
   */
  const handleDismiss = useCallback(() => {
    setShowQr(false);
    onDismiss();
  }, [onDismiss]);

  /**
   * Opens the system share sheet for the content URL or app URI.
   */
  const handleShare = snackbarTry(async () => {
    await shareLinkToApps(webUrl, contentText);
  });

  /**
   * Copies the content URL or app URI. The sheet stays open so further actions remain available.
   */
  const handleCopy = snackbarTry(() => {
    setString(webUrl);
  });

  /**
   * Opens the content URL in the system browser. The sheet stays open so further
   * actions remain available when the user returns to the app.
   */
  const handleOpenInBrowser = snackbarTry(() => {
    return openInBrowser(webUrl);
  });

  /**
   * Shows or hides the QR. AppBottomSheet then snaps the open sheet to the new height.
   */
  const handleToggleQr = () => {
    setShowQr(current => !current);
  };

  return (
    <AppBottomSheet
      title={getShareSheetTitle(contentType)}
      isPresented={isPresented}
      onDismiss={handleDismiss}
      buttonCount={4}
      extraHeight={extraHeight}
      enableOverDrag={false}>
      <AppBottomSheetButton
        buttonText={'Share to Apps'}
        onPress={handleShare}
        icon={AppIcons.share}
        testID={'shareNative-button'}
      />
      <AppBottomSheetButton
        buttonText={'Copy Link to Clipboard'}
        onPress={handleCopy}
        icon={AppIcons.copy}
        testID={'shareCopyLink-button'}
      />
      <AppBottomSheetButton
        buttonText={'Open in Browser'}
        onPress={handleOpenInBrowser}
        icon={AppIcons.webview}
        testID={'shareOpenInBrowser-button'}
      />
      <AppBottomSheetButton
        buttonText={showQr ? 'Hide QR Code' : 'Show QR Code'}
        onPress={handleToggleQr}
        icon={AppIcons.qrcode}
        testID={'shareShowQr-button'}
      />
      {showQr && webUrl.length > 0 && <ShareQRCode url={webUrl} />}
    </AppBottomSheet>
  );
};
