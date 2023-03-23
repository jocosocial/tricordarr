import React from 'react';
import {View} from 'react-native';
import {commonStyles} from '../../../styles';

interface PaddedContentViewProps {
  children: [JSX.Element];
}

export const PaddedContentView = ({children}: PaddedContentViewProps) => {
  const style = {
    ...commonStyles.flex,
    ...commonStyles.paddingSides,
  };

  return <View style={style}>{children}</View>;
};
