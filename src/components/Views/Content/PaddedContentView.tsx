import React, {PropsWithChildren} from 'react';
import {View, ViewStyle} from 'react-native';
import {commonStyles} from '../../../styles';

interface PaddedContentViewProps {
  padSides?: boolean;
  padBottom?: boolean;
  style?: ViewStyle;
}

/**
 * High level container used to wrap content that maybe shouldn't extend
 * to the edges of the screen.
 */
export const PaddedContentView = ({
  children,
  padBottom = true,
  padSides = true,
  style = {},
}: PropsWithChildren<PaddedContentViewProps>) => {
  const paddedContentViewStyle = [
    ...[style],
    commonStyles.flex,
    padSides ? commonStyles.paddingSides : undefined,
    padBottom ? commonStyles.paddingBottom : undefined,
  ];

  return <View style={paddedContentViewStyle}>{children}</View>;
};
