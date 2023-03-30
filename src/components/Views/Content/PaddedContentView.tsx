import React, {PropsWithChildren} from 'react';
import {View} from 'react-native';
import {commonStyles} from '../../../styles';

interface PaddedContentViewProps {
  padBottom?: boolean;
}

/**
 * High level container used to wrap content that maybe shouldn't extend
 * to the edges of the screen.
 */
export const PaddedContentView = ({children, padBottom = true}: PropsWithChildren<PaddedContentViewProps>) => {
  const style = [commonStyles.flex, commonStyles.paddingSides, padBottom ? commonStyles.paddingBottom : undefined];

  return <View style={style}>{children}</View>;
};
