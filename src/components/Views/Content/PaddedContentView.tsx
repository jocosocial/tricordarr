import React, {PropsWithChildren} from 'react';
import {View} from 'react-native';
import {commonStyles} from '../../../styles';

/**
 * High level container used to wrap content that maybe shouldn't extend
 * to the edges of the screen.
 */
export const PaddedContentView = ({children}: PropsWithChildren) => {
  const style = {
    ...commonStyles.flex,
    ...commonStyles.paddingSides,
    ...commonStyles.paddingBottom,
  };

  return <View style={style}>{children}</View>;
};
