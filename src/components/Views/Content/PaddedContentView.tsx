import React, {PropsWithChildren} from 'react';
import {View} from 'react-native';
import {commonStyles} from '../../../styles';

export const PaddedContentView = ({children}: PropsWithChildren) => {
  const style = {
    ...commonStyles.flex,
    ...commonStyles.paddingSides,
  };

  return <View style={style}>{children}</View>;
};
