import {BottomSheetBackdrop, type BottomSheetBackdropProps, BottomSheetModal} from '@gorhom/bottom-sheet';
import {useBackHandler} from '@react-native-community/hooks';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {Linking, StyleSheet, Switch, View} from 'react-native';
import {Text} from 'react-native-paper';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Share from 'react-native-share';

import {PrimaryActionButton} from '#src/Components/Buttons/PrimaryActionButton';
import {ShareQRCode, shareQrSize} from '#src/Components/QRCodes/ShareQRCode';
import {
  BottomSheetSnackbarContainer,
  MeasuredBottomSheetView,
} from '#src/Components/Sheets/BottomSheetSnackbarContainer';
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
  const isSheetOpenRef = useRef(false);
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
   * One snap point so the sheet cannot be dragged to QR height.
   * Height follows QR visibility; pan down still closes.
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
    return [showQr ? compact + qrBlock : compact];
  }, [insets.bottom, showQr]);

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
   * never render. Re-seed Use Web URLs from the saved preference on each present
   * so a sheet session can override it without writing back to appConfig.
   */
  useEffect(() => {
    if (isPresented) {
      sheetRef.current?.present();
      isSheetOpenRef.current = true;
      setShareWebURLs(!appConfig.userPreferences.shareAppURI);
    }
  }, [isPresented, appConfig.userPreferences.shareAppURI]);

  /**
   * Snap to the current (single) height after QR show/hide changes snapPoints.
   * Skip while closed so a dismiss-time QR reset does not present() from the bottom.
   */
  useEffect(() => {
    if (!isSheetOpenRef.current) {
      return;
    }
    sheetRef.current?.snapToIndex(0);
  }, [snapPoints]);

  /**
   * Close the share sheet on Android Back before navigation or the root exit guard.
   * Key off Gorhom's presented ref, not React isPresented, so Back still works
   * after Open in Browser backgrounds the app.
   */
  const handleShareSheetBackPress = useCallback(() => {
    if (!isSheetOpenRef.current) {
      return false;
    }
    sheetRef.current?.dismiss();
    return true;
  }, []);

  useBackHandler(handleShareSheetBackPress);

  /**
   * Overlay tap target so the sheet can be dismissed without dragging.
   */
  const renderBackdrop = useCallback((props: BottomSheetBackdropProps) => {
    return <BottomSheetBackdrop {...props} appearsOnIndex={0} disappearsOnIndex={-1} pressBehavior={'close'} />;
  }, []);

  /**
   * Reset QR and the presented ref only when Gorhom actually closes, then
   * notify the provider. Next present starts compact.
   */
  const handleDismiss = useCallback(() => {
    isSheetOpenRef.current = false;
    setShowQr(false);
    onDismiss();
  }, [onDismiss]);

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
   * Opens the content URL in the system browser. The sheet stays open so further
   * actions remain available when the user returns to the app.
   */
  const handleOpenInBrowser = snackbarTry(() => {
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
   * Shows or hides the QR. The single snap point grows or shrinks with showQr;
   * the snapPoints effect then snaps the existing sheet to that height.
   */
  const handleToggleQr = () => {
    setShowQr(current => !current);
  };

  return (
    <BottomSheetModal
      ref={sheetRef}
      index={0}
      snapPoints={snapPoints}
      enableDynamicSizing={false}
      enableOverDrag={false}
      enablePanDownToClose={true}
      onDismiss={handleDismiss}
      containerComponent={BottomSheetSnackbarContainer}
      backdropComponent={renderBackdrop}
      backgroundStyle={styles.background}
      handleIndicatorStyle={styles.handleIndicator}>
      <MeasuredBottomSheetView>
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
      </MeasuredBottomSheetView>
    </BottomSheetModal>
  );
};
