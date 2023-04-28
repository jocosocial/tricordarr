import React, {PropsWithChildren} from 'react';
import {View} from 'react-native';
import {Portal, Provider, useTheme} from 'react-native-paper';
import {commonStyles} from '../../styles';
import {ErrorSnackbar} from '../ErrorHandlers/ErrorSnackbar';
import {ErrorBanner} from '../ErrorHandlers/ErrorBanner';
import {ModalProvider} from '../Context/Providers/ModalProvider';
import {AppModal} from '../Modals/AppModal';

/**
 * Highest level View container that contains app-specific components that
 * can be utilized by all children. For example, error messages.
 */
export const AppView = ({children}: PropsWithChildren) => {
  const theme = useTheme();

  const style = {
    backgroundColor: theme.colors.background,
    ...commonStyles.flex,
  };

  return (
    <Portal.Host>
      <View style={style}>
        <Portal>
          <AppModal />
        </Portal>
        <ErrorBanner />
        {children}
        <ErrorSnackbar />
      </View>
    </Portal.Host>
  );
};
