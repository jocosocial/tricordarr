import React, {PropsWithChildren} from 'react';
import {StyleSheet, View} from 'react-native';
import {Portal} from 'react-native-paper';
import {ErrorSnackbar} from '../Snackbars/ErrorSnackbar';
import {ErrorBanner} from '../Banners/ErrorBanner.tsx';
import {AppModal} from '../Modals/AppModal';
import {InfoSnackbar} from '../Snackbars/InfoSnackbar';
import {useStyles} from '../Context/Contexts/StyleContext';
import {ConnectionDisruptedView} from './Warnings/ConnectionDisruptedView.tsx';
import {useSwiftarrQueryClient} from '../Context/Contexts/SwiftarrQueryClientContext';
import {UnsavedChangesView} from './Warnings/UnsavedChangesView.tsx';
import {useErrorHandler} from '../Context/Contexts/ErrorHandlerContext.ts';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

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
  });

  return (
    <View style={styles.appView}>
      <Portal>
        <ErrorBanner />
        <AppModal />
        <ErrorSnackbar />
        <InfoSnackbar />
      </Portal>
      {disruptionDetected && <ConnectionDisruptedView />}
      {children}
      <UnsavedChangesView isVisible={hasUnsavedWork} />
    </View>
  );
};
