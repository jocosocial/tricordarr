import React from 'react';
import {View} from 'react-native';
import {useTheme} from 'react-native-paper';
import {commonStyles} from '../../styles';
import {ErrorSnackbar} from '../ErrorHandlers/ErrorSnackbar';
import {ErrorBanner} from '../ErrorHandlers/ErrorBanner';

/**
 * Highest level View container that contains app-specific components that
 * can be utilized by all children. For example, error messages.
 */
export const AppView = ({children}) => {
  const theme = useTheme();

  const style = {
    backgroundColor: theme.colors.background,
    ...commonStyles.flex,
  };

  return (
    <View style={style}>
      <ErrorBanner />
      {children}
      <ErrorSnackbar />
    </View>
  );
};
