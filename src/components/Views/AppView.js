import React from 'react';
import {View} from 'react-native';
import {useTheme} from 'react-native-paper';
import {commonStyles} from '../../styles';
import {ErrorSnackbar} from '../Snackbars/ErrorSnackbar';

export const AppView = ({children}) => {
  const theme = useTheme();

  const style = {
    backgroundColor: theme.colors.background,
    ...commonStyles.flex,
  };

  return (
    <View style={style}>
      {children}
      <ErrorSnackbar />
    </View>
  );
};
