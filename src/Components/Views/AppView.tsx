import {useHeaderHeight} from '@react-navigation/elements';
import {useFocusEffect} from '@react-navigation/native';
import React, {PropsWithChildren, useCallback} from 'react';
import {StyleSheet, View} from 'react-native';
import {KeyboardAvoidingView as ModuleKeyboardAvoidingView} from 'react-native-keyboard-controller';
import {Portal} from 'react-native-paper';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {ErrorBanner} from '#src/Components/Banners/ErrorBanner';
import {AppModal} from '#src/Components/Modals/AppModal';
import {AppSnackbar} from '#src/Components/Snackbars/AppSnackbar';
import {ConnectionDisruptedView} from '#src/Components/Views/Warnings/ConnectionDisruptedView';
import {PreRegistrationWarningView} from '#src/Components/Views/Warnings/PreRegistrationWarningView';
import {UnsavedChangesView} from '#src/Components/Views/Warnings/UnsavedChangesView';
import {useErrorHandler} from '#src/Context/Contexts/ErrorHandlerContext';
import {useLayout} from '#src/Context/Contexts/LayoutContext';
import {usePreRegistration} from '#src/Context/Contexts/PreRegistrationContext';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {useSwiftarrQueryClient} from '#src/Context/Contexts/SwiftarrQueryClientContext';
import {createLogger} from '#src/Libraries/Logger';
import {isIOS} from '#src/Libraries/Platform/Detection';

const logger = createLogger('AppView.tsx');

interface AppViewProps extends PropsWithChildren {
  disablePreRegistrationWarning?: boolean;
}

/**
 * Highest level View container that contains app-specific components that
 * can be utilized by all children. For example, error messages.
 */
export const AppView = ({children, disablePreRegistrationWarning = false}: AppViewProps) => {
  const {commonStyles} = useStyles();
  const {disruptionDetected} = useSwiftarrQueryClient();
  const {hasUnsavedWork} = useErrorHandler();
  // https://reactnavigation.org/docs/6.x/handling-safe-area
  const insets = useSafeAreaInsets();
  const {preRegistrationMode} = usePreRegistration();
  const {headerHeight, headerHeightValue, footerHeightValue} = useLayout();
  const directHeaderHeight = useHeaderHeight();

  // Log layout values for debugging
  // console.log('[AppView.tsx] insets', insets);
  // console.log(`[AppView.tsx] headerHeightValue: ${headerHeightValue}, footerHeightValue: ${footerHeightValue}`);
  // console.log(`[AppView.tsx] headerHeight: ${directHeaderHeight}`);

  const styles = StyleSheet.create({
    appView: {
      ...commonStyles.background,
      ...commonStyles.flex,
      // Apply safe area insets only if header/footer heights are zero
      // This ensures proper spacing when navigation bars aren't present
      ...(headerHeightValue === 0 ? commonStyles.safePaddingTop : undefined),
      ...(footerHeightValue === 0 ? commonStyles.safePaddingBottom : undefined),
    },
    keyboardView: {
      ...commonStyles.flex,
    },
  });

  /**
   * Holy fuck what an adventure the KeyboardAvoidingView is.
   * This issue covers most of it: https://github.com/facebook/react-native/issues/52596
   * And a comment in this one gave the first workable solution: https://github.com/facebook/react-native/issues/49759
   *
   * Some old references and docs:
   * https://reactnative.dev/docs/keyboardavoidingview
   * https://stackoverflow.com/questions/43854912/react-native-keyboardavoidingview-covers-last-text-input
   * https://github.com/react-native-community/discussions-and-proposals/discussions/827
   *
   * behavior='padding' is used instead of 'translate-with-padding' because
   * the latter applies a translateY transform AND padding simultaneously
   * during the keyboard animation. In screens with LegendList-based
   * conversation lists (FezChatScreen, ForumThreadScreenBase), the translateY
   * fights with maintainVisibleContentPosition and alignItemsAtEnd — the list
   * tries to adjust scroll position in response to layout changes while the
   * view is also being physically displaced by the transform. This causes the
   * ListHeaderComponent to visibly jitter out of view during the animation
   * and pop back when it settles. 'padding' only adjusts bottom padding,
   * which the list handles as a natural layout change without conflict.
   */
  var keyboardVerticalOffset = insets.top + insets.bottom;
  if (isIOS && insets.bottom === 0) {
    keyboardVerticalOffset += 40;
  }

  /**
   * Any time a screen is focused, set the header height. The value includes any
   * safe area insets since thats handled by React Navigation.
   */
  useFocusEffect(
    useCallback(() => {
      logger.debug('useFocusEffect setting headerHeight', directHeaderHeight);
      headerHeight.set(directHeaderHeight);
    }, [directHeaderHeight, headerHeight]),
  );

  return (
    <View style={styles.appView}>
      <ModuleKeyboardAvoidingView
        style={styles.keyboardView}
        behavior={'padding'}
        keyboardVerticalOffset={keyboardVerticalOffset}>
        <Portal>
          <ErrorBanner />
          <AppModal />
          <AppSnackbar />
        </Portal>
        {preRegistrationMode && !disablePreRegistrationWarning && <PreRegistrationWarningView />}
        {disruptionDetected && <ConnectionDisruptedView />}
        {children}
        <UnsavedChangesView isVisible={hasUnsavedWork} />
      </ModuleKeyboardAvoidingView>
    </View>
  );
};
