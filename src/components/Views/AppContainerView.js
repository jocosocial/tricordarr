import React from 'react';
import {View} from 'react-native';
import {commonStyles} from '../../styles';

export const AppContainerView = ({children, isStack = false}) => {
  const marginStyle = isStack ? commonStyles.marginNotTop : commonStyles.margin;
  const style = {
    ...commonStyles.flex,
    ...marginStyle,
  };

  return <View style={style}>{children}</View>;
};
