import React from 'react';
import {View} from 'react-native';
import {commonStyles} from '../../styles';

export const AppContainerView = ({children}) => {
  const style = {
    ...commonStyles.flex,
    ...commonStyles.margin,
  };

  return <View style={style}>{children}</View>;
};
