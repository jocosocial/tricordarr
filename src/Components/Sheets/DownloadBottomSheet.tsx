import {BottomSheetBackdrop, type BottomSheetBackdropProps, BottomSheetModal} from '@gorhom/bottom-sheet';
import {useBackHandler} from '@react-native-community/hooks';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {StyleSheet, View} from 'react-native';
import {Text} from 'react-native-paper';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {PrimaryActionButton} from '#src/Components/Buttons/PrimaryActionButton';
import {
  BottomSheetSnackbarContainer,
  MeasuredBottomSheetView,
} from '#src/Components/Sheets/BottomSheetSnackbarContainer';
import {useSnackbar} from '#src/Context/Contexts/SnackbarContext';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {useAppTheme} from '#src/Context/Contexts/ThemeContext';
import {styleDefaults} from '#src/Context/Providers/StyleProvider';
import {AppIcons} from '#src/Enums/Icons';
import {DownloadSheetContent, getDownloadFileName, getDownloadSheetTitle} from '#src/Libraries/Download';
import {saveTextToPickedDirectory} from '#src/Libraries/Storage/saveTextToPickedDirectory';
import {shareTextAsCachedFile} from '#src/Libraries/Storage/shareTextAsCachedFile';

const handleHeight = 24;
const titleHeight = 24;
const paperButtonHeight = 40;
const itemGap = styleDefaults.marginSize / 2;
const layoutBuffer = 16;
const buttonCount = 2;

interface DownloadBottomSheetProps {
  content?: DownloadSheetContent;
  isPresented: boolean;
  onDismiss: () => void;
}

/**
 * Download sheet with save-to-folder and system-share actions for a text file.
 */
export const DownloadBottomSheet = ({content, isPresented, onDismiss}: DownloadBottomSheetProps) => {
  const sheetRef = useRef<BottomSheetModal>(null);
  const {setSnackbarPayload, snackbarTry} = useSnackbar();
  const {theme} = useAppTheme();
  const {commonStyles} = useStyles();
  const insets = useSafeAreaInsets();
  const [isSaving, setIsSaving] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const isBusy = isSaving || isSharing;

  /**
   * Fits the title and the two action buttons.
   */
  const snapPoints = useMemo(() => {
    const paddingBottom = insets.bottom + styleDefaults.marginSize;
    const compact =
      handleHeight +
      titleHeight +
      paperButtonHeight * buttonCount +
      itemGap * buttonCount +
      paddingBottom +
      layoutBuffer;
    return [compact];
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
   * never render.
   */
  useEffect(() => {
    if (isPresented) {
      sheetRef.current?.present();
    }
  }, [isPresented]);

  /**
   * Close the download sheet on Android Back before navigation or the root exit guard.
   * Call dismiss() only while presented so Gorhom does not stick in DISMISSING.
   */
  const handleDownloadSheetBackPress = useCallback(() => {
    if (!isPresented) {
      return false;
    }
    sheetRef.current?.dismiss();
    return true;
  }, [isPresented]);

  useBackHandler(handleDownloadSheetBackPress);

  /**
   * Overlay tap target so the sheet can be dismissed without dragging.
   */
  const renderBackdrop = useCallback((props: BottomSheetBackdropProps) => {
    return <BottomSheetBackdrop {...props} appearsOnIndex={0} disappearsOnIndex={-1} pressBehavior={'close'} />;
  }, []);

  /**
   * Prompts for a folder and writes the file. Stays open if the picker is cancelled.
   */
  const handleSave = snackbarTry(async () => {
    if (!content) {
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
   * Opens the system share sheet for the file. Stays open if the user cancels.
   */
  const handleShare = snackbarTry(async () => {
    if (!content) {
      return;
    }
    setIsSharing(true);
    try {
      await shareTextAsCachedFile({
        fileName: getDownloadFileName(content),
        mimeType: content.mimeType,
        contents: content.contents,
      });
    } finally {
      setIsSharing(false);
    }
  });

  return (
    <BottomSheetModal
      ref={sheetRef}
      index={0}
      snapPoints={snapPoints}
      enableDynamicSizing={false}
      enablePanDownToClose={true}
      onDismiss={onDismiss}
      containerComponent={BottomSheetSnackbarContainer}
      backdropComponent={renderBackdrop}
      backgroundStyle={styles.background}
      handleIndicatorStyle={styles.handleIndicator}>
      <MeasuredBottomSheetView>
        <View style={styles.content}>
          <Text style={styles.title}>{getDownloadSheetTitle(content)}</Text>
          <PrimaryActionButton
            buttonText={'Save to Folder'}
            onPress={handleSave}
            buttonColor={theme.colors.twitarrNeutralButton}
            icon={AppIcons.download}
            testID={'downloadSave-button'}
            viewStyle={styles.button}
            disabled={isBusy}
            isLoading={isSaving}
          />
          <PrimaryActionButton
            buttonText={'Share to Apps'}
            onPress={handleShare}
            buttonColor={theme.colors.twitarrNeutralButton}
            icon={AppIcons.share}
            testID={'downloadShare-button'}
            viewStyle={styles.button}
            disabled={isBusy}
            isLoading={isSharing}
          />
        </View>
      </MeasuredBottomSheetView>
    </BottomSheetModal>
  );
};
