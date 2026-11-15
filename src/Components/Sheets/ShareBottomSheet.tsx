import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {StyleSheet, Switch, View} from 'react-native';
import {Text} from 'react-native-paper';
import Share from 'react-native-share';

import {ShareQRCode, shareQrSize} from '#src/Components/QRCodes/ShareQRCode';
import {AppBottomSheet, bottomSheetItemGap, bottomSheetItemWidth} from '#src/Components/Sheets/AppBottomSheet';
import {AppBottomSheetButton} from '#src/Components/Sheets/AppBottomSheetButton';
import {useConfig} from '#src/Context/Contexts/ConfigContext';
import {useSnackbar} from '#src/Context/Contexts/SnackbarContext';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {useSwiftarrQueryClient} from '#src/Context/Contexts/SwiftarrQueryClientContext';
import {useAppTheme} from '#src/Context/Contexts/ThemeContext';
import {AppIcons} from '#src/Enums/Icons';
import {useClipboard} from '#src/Hooks/useClipboard';
import {openInBrowser} from '#src/Libraries/Browser';
import {isAndroid} from '#src/Libraries/Platform/Detection';
import {
  buildShareMessage,
  getShareLink,
  getShareSheetTitle,
  ShareContentType,
  ShareLinkMode,
} from '#src/Libraries/Sharing';

const switchRowHeight = 32;

interface ShareBottomSheetProps {
  contentType?: ShareContentType;
  contentID?: string | number;
  contentText?: string;
  isPresented: boolean;
  onDismiss: () => void;
}

/**
 * Share sheet with copy, browser, and optional QR actions for the content URL.
 * Copy, Share to Apps, and the QR use app deep links unless Share Web URLs is on.
 * Open in Browser always uses the web URL.
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
  const {theme} = useAppTheme();
  const {commonStyles} = useStyles();
  const {appConfig} = useConfig();
  const {serverUrl} = useSwiftarrQueryClient();
  const [shareWebURLs, setShareWebURLs] = useState(!appConfig.userPreferences.shareAppURI);
  const hasContent = contentType !== undefined && contentID !== undefined;
  const webUrl = hasContent ? getShareLink({mode: ShareLinkMode.web, serverUrl, contentType, contentID}) : '';
  const shareTarget = hasContent
    ? getShareLink({
        mode: shareWebURLs ? ShareLinkMode.web : ShareLinkMode.app,
        serverUrl,
        contentType,
        contentID,
      })
    : '';

  // The switch row, plus the QR when it's showing. The sheet re-snaps to fit.
  const extraHeight = switchRowHeight + bottomSheetItemGap + (showQr ? shareQrSize + bottomSheetItemGap : 0);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        switchRow: {
          width: bottomSheetItemWidth,
          height: switchRowHeight,
          ...commonStyles.flexRow,
          ...commonStyles.alignItemsCenter,
          ...commonStyles.justifySpaceBetween,
        },
        switchLabel: {
          color: theme.colors.onBackground,
        },
      }),
    [commonStyles, theme.colors.onBackground],
  );

  /**
   * Re-seed Use Web URLs from the saved preference on each present so a sheet session can
   * override it without writing back to appConfig.
   */
  useEffect(() => {
    if (isPresented) {
      setShareWebURLs(!appConfig.userPreferences.shareAppURI);
    }
  }, [isPresented, appConfig.userPreferences.shareAppURI]);

  /**
   * Reset QR only when Gorhom actually closes, then notify the provider. Next present starts compact.
   */
  const handleDismiss = useCallback(() => {
    setShowQr(false);
    onDismiss();
  }, [onDismiss]);

  /**
   * Opens the system share sheet for the content URL or app URI.
   * Android puts the link in message so it is sent as text; iOS uses url so the sheet can preview it.
   * When contentText is present (e.g. a post body), both platforms share it combined with the
   * link as one plaintext message instead, since there's no separate preview to preserve.
   */
  const handleShare = snackbarTry(async () => {
    await Share.open({
      ...(contentText
        ? {message: buildShareMessage(contentText, shareTarget)}
        : isAndroid
          ? {message: shareTarget}
          : {url: shareTarget}),
      failOnCancel: false,
    });
  });

  /**
   * Copies the content URL or app URI. The sheet stays open so further actions remain available.
   */
  const handleCopy = snackbarTry(() => {
    setString(shareTarget);
  });

  /**
   * Opens the content URL in the system browser. The sheet stays open so further
   * actions remain available when the user returns to the app.
   */
  const handleOpenInBrowser = snackbarTry(() => {
    return openInBrowser(webUrl);
  });

  /**
   * Overrides Use Web URLs for this sheet session only. Does not persist.
   * The QR and share/copy actions read this on the next render without remounting.
   */
  const handleShareWebURLsChange = (value: boolean) => {
    setShareWebURLs(value);
  };

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
      <View style={styles.switchRow}>
        <Text style={styles.switchLabel}>Use Web URL</Text>
        <Switch value={shareWebURLs} onValueChange={handleShareWebURLsChange} testID={'shareWebURLs-sheet-switch'} />
      </View>
      {showQr && webUrl.length > 0 && <ShareQRCode url={shareTarget} />}
    </AppBottomSheet>
  );
};
