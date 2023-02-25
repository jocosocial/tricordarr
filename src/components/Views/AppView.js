import React from 'react';
import {View} from 'react-native';
import {useTheme} from 'react-native-paper';

export const AppView = ({children}) => {
  const theme = useTheme();

  const style = {
    // backgroundColor: theme.colors.background,
    backgroundColor: 'pink',
    flex: 1,
  };

  return <View style={style}>{children}</View>;
};
