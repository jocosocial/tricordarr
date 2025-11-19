import React, {PropsWithChildren} from 'react';
import {Platform, StyleSheet, View} from 'react-native';
import {KeyboardAvoidingView as ModuleKeyboardAvoidingView} from 'react-native-keyboard-controller';
import {Portal} from 'react-native-paper';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {ErrorBanner} from '#src/Components/Banners/ErrorBanner';
import {HeaderHeightMeasurer} from '#src/Components/Layout/HeaderHeightMeasurer';
import {AppModal} from '#src/Components/Modals/AppModal';
import {AppSnackbar} from '#src/Components/Snackbars/AppSnackbar';
import {ConnectionDisruptedView} from '#src/Components/Views/Warnings/ConnectionDisruptedView';
import {PreRegistrationWarningView} from '#src/Components/Views/Warnings/PreRegistrationWarningView';
import {UnsavedChangesView} from '#src/Components/Views/Warnings/UnsavedChangesView';
import {useConfig} from '#src/Context/Contexts/ConfigContext';
import {useErrorHandler} from '#src/Context/Contexts/ErrorHandlerContext';
import {useLayout} from '#src/Context/Contexts/LayoutContext';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {useSwiftarrQueryClient} from '#src/Context/Contexts/SwiftarrQueryClientContext';

interface AppViewProps extends PropsWithChildren {
  safeEdges?: ('top' | 'bottom' | 'left' | 'right')[];
}

/**
 * Highest level View container that contains app-specific components that
 * can be utilized by all children. For example, error messages.
 */
export const AppView = ({children, safeEdges: _safeEdges}: AppViewProps) => {
  const {commonStyles} = useStyles();
  const {disruptionDetected} = useSwiftarrQueryClient();
  const {hasUnsavedWork} = useErrorHandler();
  // https://reactnavigation.org/docs/6.x/handling-safe-area
  const insets = useSafeAreaInsets();
  const {preRegistrationMode} = useConfig();
  const {headerHeightValue, footerHeightValue} = useLayout();

  // Log layout values for debugging
  console.log('insets', insets);
  console.log(`[AppView] headerHeight: ${headerHeightValue}, footerHeight: ${footerHeightValue}`);

  // Apply safe area insets only if header/footer heights are zero
  // This ensures proper spacing when navigation bars aren't present
  const paddingTop = headerHeightValue === 0 ? insets.top : undefined;
  const paddingBottom = footerHeightValue === 0 ? insets.bottom : undefined;

  const styles = StyleSheet.create({
    appView: {
      ...commonStyles.background,
      ...commonStyles.flex,
      // I hate all of this shit.
      paddingTop,
      paddingBottom,
      paddingLeft: undefined,
      paddingRight: undefined,
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
   */
  var keyboardVerticalOffset = insets.top + insets.bottom;
  if (Platform.OS === 'ios' && insets.bottom === 0) {
    keyboardVerticalOffset += 40;
  }

  return (
    <View style={styles.appView}>
      <ModuleKeyboardAvoidingView
        style={styles.keyboardView}
        // behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        behavior={'translate-with-padding'}
        keyboardVerticalOffset={keyboardVerticalOffset}>
        <Portal>
          <ErrorBanner />
          <AppModal />
          <AppSnackbar />
        </Portal>
        <HeaderHeightMeasurer />
        {preRegistrationMode && <PreRegistrationWarningView />}
        {disruptionDetected && <ConnectionDisruptedView />}
        {children}
        <UnsavedChangesView isVisible={hasUnsavedWork} />
      </ModuleKeyboardAvoidingView>
    </View>
  );
};
