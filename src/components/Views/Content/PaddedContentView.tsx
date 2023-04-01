import React, {PropsWithChildren} from 'react';
import {View} from 'react-native';
import {commonStyles} from '../../../styles';

interface PaddedContentViewProps {
  padSides?: boolean;
  padBottom?: boolean;
}

/**
 * High level container used to wrap content that maybe shouldn't extend
 * to the edges of the screen.
 */
export const PaddedContentView = ({
  children,
  padBottom = true,
  padSides = true,
}: PropsWithChildren<PaddedContentViewProps>) => {
  const style = [
    commonStyles.flex,
    padSides ? commonStyles.paddingSides : undefined,
    padBottom ? commonStyles.paddingBottom : undefined,
  ];

  return <View style={style}>{children}</View>;
};
