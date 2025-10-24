import React, {PropsWithChildren} from 'react';
import {StyleProp, View, ViewStyle} from 'react-native';

import {commonStyles} from '#src/Styles';

interface PaddedContentViewProps {
  padSides?: boolean;
  padBottom?: boolean;
  padTop?: boolean;
  style?: StyleProp<ViewStyle>;
  small?: boolean;
}

/**
 * High level container used to wrap content that maybe shouldn't extend
 * to the edges of the screen.
 */
export const PaddedContentView = ({
  children,
  padBottom = true,
  padSides = true,
  padTop = false,
  style = {},
  small = true,
}: PropsWithChildren<PaddedContentViewProps>) => {
  const paddedContentViewStyle = [
    ...[style],
    commonStyles.flex,
    padTop ? (small ? commonStyles.paddingTopSmall : commonStyles.paddingTop) : undefined,
    padSides ? (small ? commonStyles.paddingHorizontalSmall : commonStyles.paddingHorizontal) : undefined,
    padBottom ? (small ? commonStyles.paddingBottomSmall : commonStyles.paddingBottom) : undefined,
  ];

  return <View style={paddedContentViewStyle}>{children}</View>;
};
