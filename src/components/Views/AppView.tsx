import React, {PropsWithChildren} from 'react';
import {KeyboardAvoidingView, StyleSheet, View} from 'react-native';
import {Portal} from 'react-native-paper';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {ErrorBanner} from '#src/Components/Banners/ErrorBanner';
import {AppModal} from '#src/Components/Modals/AppModal';
import {AppSnackbar} from '#src/Components/Snackbars/AppSnackbar';
import {ConnectionDisruptedView} from '#src/Components/Views/Warnings/ConnectionDisruptedView';
import {PreRegistrationWarningView} from '#src/Components/Views/Warnings/PreRegistrationWarningView';
import {UnsavedChangesView} from '#src/Components/Views/Warnings/UnsavedChangesView';
import {useConfig} from '#src/Context/Contexts/ConfigContext';
import {useErrorHandler} from '#src/Context/Contexts/ErrorHandlerContext';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {useSwiftarrQueryClient} from '#src/Context/Contexts/SwiftarrQueryClientContext';

interface AppViewProps extends PropsWithChildren {
  safeEdges?: ('top' | 'bottom' | 'left' | 'right')[];
}

/**
 * Highest level View container that contains app-specific components that
 * can be utilized by all children. For example, error messages.
 */
export const AppView = ({children, safeEdges}: AppViewProps) => {
  const {commonStyles} = useStyles();
  const {disruptionDetected} = useSwiftarrQueryClient();
  const {hasUnsavedWork} = useErrorHandler();
  // https://reactnavigation.org/docs/6.x/handling-safe-area
  const insets = useSafeAreaInsets();
  const {preRegistrationMode} = useConfig();

  const styles = StyleSheet.create({
    appView: {
      ...commonStyles.background,
      ...commonStyles.flex,
      // I hate all of this shit.
      paddingTop: safeEdges?.includes('top') ? insets.top : undefined,
      paddingBottom: safeEdges?.includes('bottom') ? insets.bottom : undefined,
      paddingLeft: safeEdges?.includes('left') ? insets.left : undefined,
      paddingRight: safeEdges?.includes('right') ? insets.right : undefined,
    },
    keyboardView: {
      ...commonStyles.flex,
    },
  });

  // The KeyboardAvoiding stuff came from
  // https://stackoverflow.com/questions/43854912/react-native-keyboardavoidingview-covers-last-text-input
  // https://github.com/react-native-community/discussions-and-proposals/discussions/827

  return (
    <View style={styles.appView}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={'padding'}
        keyboardVerticalOffset={insets.top + insets.bottom}>
        <Portal>
          <ErrorBanner />
          <AppModal />
          <AppSnackbar />
        </Portal>
        {preRegistrationMode && <PreRegistrationWarningView />}
        {disruptionDetected && <ConnectionDisruptedView />}
        {children}
      </KeyboardAvoidingView>
      <UnsavedChangesView isVisible={hasUnsavedWork} />
    </View>
  );
};
