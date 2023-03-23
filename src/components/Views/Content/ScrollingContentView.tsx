import React from 'react';
import {ScrollView, View} from 'react-native';
import {commonStyles} from '../../../styles';

interface ScrollingContentViewProps {
  children: JSX.Element;
  isStack?: boolean;
  refreshControl?: JSX.Element;
}

/**
 * View container for app content that scrolls. Also do some formatting to look good.
 * Accepts a single element as a child.
 */
export const ScrollingContentView = ({children, isStack = false, refreshControl}: ScrollingContentViewProps) => {
  const style = {
    ...commonStyles.flex,
    ...(isStack ? null : commonStyles.marginTop),
    ...commonStyles.marginBottom,
  };

  return (
    <ScrollView refreshControl={refreshControl}>
      <View style={style}>{children}</View>
    </ScrollView>
  );
};
