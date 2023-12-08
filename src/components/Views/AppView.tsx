import React, {PropsWithChildren} from 'react';
import {View} from 'react-native';
import {Portal, useTheme} from 'react-native-paper';
import {commonStyles} from '../../styles';
import {ErrorSnackbar} from '../Snackbars/ErrorSnackbar';
import {ErrorBanner} from '../ErrorHandlers/ErrorBanner';
import {AppModal} from '../Modals/AppModal';
import {InfoSnackbar} from '../Snackbars/InfoSnackbar';
import {useIsFocused, useNavigation, useRoute} from '@react-navigation/native';

type AppViewProps = PropsWithChildren<{}>;

/**
 * Highest level View container that contains app-specific components that
 * can be utilized by all children. For example, error messages.
 */
export const AppView = ({children}: AppViewProps) => {
  const theme = useTheme();
  const isFocused = useIsFocused();
  const route = useRoute();

  const style = {
    backgroundColor: theme.colors.background,
    ...commonStyles.flex,
  };

  if (!isFocused) {
    console.log(`[AppView.tsx] Route ${route.name} is not focused.`);
    // idk about this...
    // return null;
  }

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
