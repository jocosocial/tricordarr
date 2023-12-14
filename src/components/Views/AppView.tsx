import React, {PropsWithChildren} from 'react';
import {StyleSheet, View} from 'react-native';
import {Portal} from 'react-native-paper';
import {ErrorSnackbar} from '../Snackbars/ErrorSnackbar';
import {ErrorBanner} from '../ErrorHandlers/ErrorBanner';
import {AppModal} from '../Modals/AppModal';
import {InfoSnackbar} from '../Snackbars/InfoSnackbar';
import {useStyles} from '../Context/Contexts/StyleContext';
import {ConnectionDisruptedView} from './ConnectionDisruptedView';
import {useSwiftarrQueryClient} from '../Context/Contexts/SwiftarrQueryClientContext';

type AppViewProps = PropsWithChildren<{}>;

/**
 * Highest level View container that contains app-specific components that
 * can be utilized by all children. For example, error messages.
 */
export const AppView = ({children}: AppViewProps) => {
  const {commonStyles} = useStyles();
  const {disruptionDetected} = useSwiftarrQueryClient();

  const styles = StyleSheet.create({
    appView: {
      ...commonStyles.background,
      ...commonStyles.flex,
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
    </View>
  );
};
