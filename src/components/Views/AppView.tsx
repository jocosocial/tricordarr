import React, {PropsWithChildren} from 'react';
import {View} from 'react-native';
import {Portal, useTheme} from 'react-native-paper';
import {commonStyles} from '../../styles';
import {ErrorSnackbar} from '../Snackbars/ErrorSnackbar';
import {ErrorBanner} from '../ErrorHandlers/ErrorBanner';
import {AppModal} from '../Modals/AppModal';
import {InfoSnackbar} from '../Snackbars/InfoSnackbar';

type AppViewProps = PropsWithChildren<{}>;

/**
 * Highest level View container that contains app-specific components that
 * can be utilized by all children. For example, error messages.
 */
export const AppView = ({children}: AppViewProps) => {
  const theme = useTheme();

  const style = {
    backgroundColor: theme.colors.background,
    ...commonStyles.flex,
  };

  return (
    <View style={style}>
      <Portal>
        <ErrorBanner />
        <AppModal />
        <ErrorSnackbar />
        <InfoSnackbar />
      </Portal>
      {children}
    </View>
  );
};
