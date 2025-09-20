import React, {PropsWithChildren} from 'react';
import {StyleProp, View, ViewStyle} from 'react-native';
import {commonStyles} from '#src/Styles';

interface PaddedContentViewProps {
  padSides?: boolean;
  padBottom?: boolean;
  padTop?: boolean;
  style?: StyleProp<ViewStyle>;
  invertVertical?: boolean;
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
  invertVertical = false,
  style = {},
}: PropsWithChildren<PaddedContentViewProps>) => {
  const paddedContentViewStyle = [
    ...[style],
    commonStyles.flex,
    padTop ? commonStyles.paddingTop : undefined,
    padSides ? commonStyles.paddingHorizontal : undefined,
    padBottom ? commonStyles.paddingBottom : undefined,
    // https://github.com/facebook/react-native/issues/30034
    invertVertical ? commonStyles.verticallyInverted : undefined,
  ];

  return <View style={paddedContentViewStyle}>{children}</View>;
};
