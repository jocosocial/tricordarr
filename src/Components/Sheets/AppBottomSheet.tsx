import {BottomSheetBackdrop, type BottomSheetBackdropProps, BottomSheetModal} from '@gorhom/bottom-sheet';
import {useBackHandler} from '@react-native-community/hooks';
import React, {PropsWithChildren, useCallback, useEffect, useMemo, useRef} from 'react';
import {StyleSheet, View} from 'react-native';
import {Text} from 'react-native-paper';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {
  BottomSheetSnackbarContainer,
  MeasuredBottomSheetView,
} from '#src/Components/Sheets/BottomSheetSnackbarContainer';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {useAppTheme} from '#src/Context/Contexts/ThemeContext';
import {styleDefaults} from '#src/Context/Providers/StyleProvider';
import {navigationRef} from '#src/Libraries/NavigationRef';

const handleHeight = 24;
const titleHeight = 24;
const paperButtonHeight = 40;
const layoutBuffer = 16;

/** Vertical gap between the sheet's rows. Add one per extra row in `extraHeight`. */
export const bottomSheetItemGap = styleDefaults.marginSize / 2;
/** Width of the sheet's buttons and rows. */
export const bottomSheetItemWidth = 280;

interface AppBottomSheetProps extends PropsWithChildren {
  title: string;
  isPresented: boolean;
  onDismiss: () => void;
  /** Number of AppBottomSheetButtons in the sheet, used to size it. */
  buttonCount: number;
  /** Height of any other rows, including their gaps. The sheet re-snaps when this changes. */
  extraHeight?: number;
  enableOverDrag?: boolean;
}

/**
 * Modal bottom sheet with a title above the children. A single snap point fits the title,
 * `buttonCount` buttons and `extraHeight`, so the sheet can't be dragged taller.
 * Closes on Android Back, on any navigation (such as an incoming link or a notification tap),
 * on a backdrop tap or on pan down. Renders snackbars above itself.
 */
export const AppBottomSheet = ({
  title,
  isPresented,
  onDismiss,
  buttonCount,
  extraHeight = 0,
  enableOverDrag,
  children,
}: AppBottomSheetProps) => {
  const sheetRef = useRef<BottomSheetModal>(null);
  // Gorhom's presented state, which can outlast isPresented when Open in Browser
  // backgrounds the app.
  const isSheetOpenRef = useRef(false);
  const {theme} = useAppTheme();
  const {commonStyles} = useStyles();
  const insets = useSafeAreaInsets();

  const snapPoints = useMemo(() => {
    const paddingBottom = insets.bottom + styleDefaults.marginSize;
    return [
      handleHeight +
        titleHeight +
        paperButtonHeight * buttonCount +
        bottomSheetItemGap * buttonCount +
        extraHeight +
        paddingBottom +
        layoutBuffer,
    ];
  }, [insets.bottom, buttonCount, extraHeight]);

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
      isSheetOpenRef.current = true;
    }
  }, [isPresented]);

  /**
   * Snap to the current (single) height after it changes, such as when content is shown or hidden.
   * Skip while closed so a dismiss-time reset does not present() from the bottom.
   */
  useEffect(() => {
    if (!isSheetOpenRef.current) {
      return;
    }
    sheetRef.current?.snapToIndex(0);
  }, [snapPoints]);

  /**
   * Dismiss only while Gorhom has the sheet open, so it does not stick in DISMISSING.
   */
  const dismissIfOpen = useCallback(() => {
    if (!isSheetOpenRef.current) {
      return false;
    }
    sheetRef.current?.dismiss();
    return true;
  }, []);

  // Close the sheet on Android Back before navigation or the root exit guard.
  useBackHandler(dismissIfOpen);

  /**
   * Close the sheet on any navigation so it doesn't stay open over the new screen.
   */
  useEffect(() => {
    if (!isPresented) {
      return;
    }
    return navigationRef.addListener('state', () => {
      dismissIfOpen();
    });
  }, [isPresented, dismissIfOpen]);

  /**
   * Overlay tap target so the sheet can be dismissed without dragging.
   */
  const renderBackdrop = useCallback((props: BottomSheetBackdropProps) => {
    return <BottomSheetBackdrop {...props} appearsOnIndex={0} disappearsOnIndex={-1} pressBehavior={'close'} />;
  }, []);

  /**
   * Clear the presented ref only when Gorhom actually closes, then notify the owner.
   */
  const handleDismiss = useCallback(() => {
    isSheetOpenRef.current = false;
    onDismiss();
  }, [onDismiss]);

  return (
    <BottomSheetModal
      ref={sheetRef}
      index={0}
      snapPoints={snapPoints}
      enableDynamicSizing={false}
      enableOverDrag={enableOverDrag}
      enablePanDownToClose={true}
      onDismiss={handleDismiss}
      containerComponent={BottomSheetSnackbarContainer}
      backdropComponent={renderBackdrop}
      backgroundStyle={styles.background}
      handleIndicatorStyle={styles.handleIndicator}>
      <MeasuredBottomSheetView>
        <View style={styles.content}>
          <Text style={styles.title}>{title}</Text>
          {children}
        </View>
      </MeasuredBottomSheetView>
    </BottomSheetModal>
  );
};
