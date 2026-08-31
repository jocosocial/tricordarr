import {
  BottomSheetBackdrop,
  type BottomSheetBackdropProps,
  BottomSheetModal,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import {useBackHandler} from '@react-native-community/hooks';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {Linking, StyleSheet, Switch, View} from 'react-native';
import {Text} from 'react-native-paper';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Share from 'react-native-share';

import {PrimaryActionButton} from '#src/Components/Buttons/PrimaryActionButton';
import {ShareQRCode, shareQrSize} from '#src/Components/QRCodes/ShareQRCode';
import {useConfig} from '#src/Context/Contexts/ConfigContext';
import {useSnackbar} from '#src/Context/Contexts/SnackbarContext';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {useSwiftarrQueryClient} from '#src/Context/Contexts/SwiftarrQueryClientContext';
import {useAppTheme} from '#src/Context/Contexts/ThemeContext';
import {styleDefaults} from '#src/Context/Providers/StyleProvider';
import {AppIcons} from '#src/Enums/Icons';
import {useClipboard} from '#src/Hooks/useClipboard';
import {isAndroid} from '#src/Libraries/Platform/Detection';
import {getShareLink, getShareSheetTitle, ShareContentType, ShareLinkMode} from '#src/Libraries/Sharing';

const handleHeight = 24;
const titleHeight = 24;
const paperButtonHeight = 40;
const itemGap = styleDefaults.marginSize / 2;
const layoutBuffer = 16;
const buttonCount = 4;
const switchRowHeight = 32;

interface ShareBottomSheetProps {
  contentType?: ShareContentType;
  contentID?: string | number;
  isPresented: boolean;
  onDismiss: () => void;
}

/**
 * Share sheet with copy, browser, and optional QR actions for the content URL.
 * Copy, Share to Apps, and the QR use app deep links unless Share Web URLs is on.
 * Open in Browser always uses the web URL.
 */
export const ShareBottomSheet = ({contentType, contentID, isPresented, onDismiss}: ShareBottomSheetProps) => {
  const sheetRef = useRef<BottomSheetModal>(null);
  const [showQr, setShowQr] = useState(false);
  const {setString} = useClipboard();
  const {snackbarTry} = useSnackbar();
  const {theme} = useAppTheme();
  const {commonStyles} = useStyles();
  const insets = useSafeAreaInsets();
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

  /**
   * Compact fits the title, actions, and URI switch. Expanded adds the QR block.
   * Both points stay registered so showing the QR snaps the same sheet
   * instead of replacing snapPoints (which re-presents from the bottom).
   */
  const snapPoints = useMemo(() => {
    const paddingBottom = insets.bottom + styleDefaults.marginSize;
    const compact =
      handleHeight +
      titleHeight +
      paperButtonHeight * buttonCount +
      itemGap * buttonCount +
      switchRowHeight +
      itemGap +
      paddingBottom +
      layoutBuffer;
    const qrBlock = shareQrSize + itemGap;
    return [compact, compact + qrBlock];
  }, [insets.bottom]);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        content: {
          ...commonStyles.alignItemsCenter,
          ...commonStyles.paddingHorizontal,
          ...commonStyles.gapSmall,
          paddingBottom: insets.bottom + styleDefaults.marginSize,
        },
        title: {
          ...commonStyles.bold,
          color: theme.colors.onBackground,
          fontSize: 18,
        },
        button: {
          width: 280,
        },
        switchRow: {
          width: 280,
          height: switchRowHeight,
          ...commonStyles.flexRow,
          ...commonStyles.alignItemsCenter,
          ...commonStyles.justifySpaceBetween,
        },
        switchLabel: {
          color: theme.colors.onBackground,
        },
        background: {
          backgroundColor: theme.colors.surface,
        },
        handleIndicator: {
          backgroundColor: theme.colors.onSurfaceVariant,
        },
      }),
    [commonStyles, insets.bottom, theme.colors.onBackground, theme.colors.onSurfaceVariant, theme.colors.surface],
  );

  /**
   * Present only when opening. Never call dismiss() while the modal is still
   * unmounted — that leaves Gorhom stuck in DISMISSING so later present() calls
   * never render. Reset the QR when the sheet is closed so the next open is fast.
   * Re-seed Use Web URLs from the saved preference on each present so a sheet
   * session can override it without writing back to appConfig.
   */
  useEffect(() => {
    if (isPresented) {
      sheetRef.current?.present();
      setShareWebURLs(!appConfig.userPreferences.shareAppURI);
    } else {
      setShowQr(false);
    }
  }, [isPresented, appConfig.userPreferences.shareAppURI]);

  /**
   * Close the share sheet on Android Back before navigation or the root exit guard.
   * Call dismiss() only while presented so Gorhom does not stick in DISMISSING.
   */
  const handleShareSheetBackPress = useCallback(() => {
    if (!isPresented) {
      return false;
    }
    sheetRef.current?.dismiss();
    return true;
  }, [isPresented]);

  useBackHandler(handleShareSheetBackPress);

  /**
   * Overlay tap target so the sheet can be dismissed without dragging.
   */
  const renderBackdrop = useCallback((props: BottomSheetBackdropProps) => {
    return <BottomSheetBackdrop {...props} appearsOnIndex={0} disappearsOnIndex={-1} pressBehavior={'close'} />;
  }, []);

  /**
   * Opens the system share sheet for the content URL or app URI.
   * Android puts the link in message so it is sent as text; iOS uses url so the sheet can preview it.
   */
  const handleShare = snackbarTry(async () => {
    await Share.open({
      ...(isAndroid ? {message: shareTarget} : {url: shareTarget}),
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
   * Dismisses the sheet and opens the content URL in the system browser.
   */
  const handleOpenInBrowser = snackbarTry(() => {
    onDismiss();
    return Linking.openURL(webUrl);
  });

  /**
   * Overrides Use Web URLs for this sheet session only. Does not persist.
   * The QR and share/copy actions read this on the next render without remounting.
   */
  const handleShareWebURLsChange = (value: boolean) => {
    setShareWebURLs(value);
  };

  /**
   * Hides the QR if the user collapses the sheet without using the button.
   */
  const handleSheetChange = useCallback((index: number) => {
    if (index < 1) {
      setShowQr(false);
    }
  }, []);

  /**
   * Shows or hides the QR by snapping the existing sheet, not presenting a new one.
   * The QR sits below the actions so it fills the extra space as the sheet grows.
   */
  const handleToggleQr = () => {
    if (showQr) {
      setShowQr(false);
      sheetRef.current?.snapToIndex(0);
      return;
    }
    setShowQr(true);
    sheetRef.current?.snapToIndex(1);
  };

  return (
    <BottomSheetModal
      ref={sheetRef}
      index={0}
      snapPoints={snapPoints}
      enableDynamicSizing={false}
      enablePanDownToClose={true}
      onChange={handleSheetChange}
      onDismiss={onDismiss}
      backdropComponent={renderBackdrop}
      backgroundStyle={styles.background}
      handleIndicatorStyle={styles.handleIndicator}>
      <BottomSheetView>
        <View style={styles.content}>
          <Text style={styles.title}>{getShareSheetTitle(contentType)}</Text>
          <PrimaryActionButton
            buttonText={'Share to Apps'}
            onPress={handleShare}
            buttonColor={theme.colors.twitarrNeutralButton}
            icon={AppIcons.share}
            testID={'shareNative-button'}
            viewStyle={styles.button}
          />
          <PrimaryActionButton
            buttonText={'Copy Link to Clipboard'}
            onPress={handleCopy}
            buttonColor={theme.colors.twitarrNeutralButton}
            icon={AppIcons.copy}
            testID={'shareCopyLink-button'}
            viewStyle={styles.button}
          />
          <PrimaryActionButton
            buttonText={'Open in Browser'}
            onPress={handleOpenInBrowser}
            buttonColor={theme.colors.twitarrNeutralButton}
            icon={AppIcons.webview}
            testID={'shareOpenInBrowser-button'}
            viewStyle={styles.button}
          />
          <PrimaryActionButton
            buttonText={showQr ? 'Hide QR Code' : 'Show QR Code'}
            onPress={handleToggleQr}
            buttonColor={theme.colors.twitarrNeutralButton}
            icon={AppIcons.qrcode}
            testID={'shareShowQr-button'}
            viewStyle={styles.button}
          />
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Use Web URL</Text>
            <Switch
              value={shareWebURLs}
              onValueChange={handleShareWebURLsChange}
              testID={'shareWebURLs-sheet-switch'}
            />
          </View>
          {showQr && webUrl.length > 0 && <ShareQRCode url={shareTarget} />}
        </View>
      </BottomSheetView>
    </BottomSheetModal>
  );
};
