import React, {PropsWithChildren, ReactElement} from 'react';
import {NativeScrollEvent, NativeSyntheticEvent, ScrollView, View} from 'react-native';
import {commonStyles} from '../../../styles';

interface ScrollingContentViewProps {
  isStack?: boolean;
  refreshControl?: ReactElement;
  // Put a big margin at the bottom in case there's a FAB covering up View contents
  // that we care about.
  overScroll?: boolean;
  onScroll?: ((event: NativeSyntheticEvent<NativeScrollEvent>) => void) | undefined;
}

/**
 * View container for app content that scrolls. Also do some formatting to look good.
 * Accepts a single element as a child.
 */
export const ScrollingContentView = ({
  children,
  isStack = false,
  refreshControl,
  overScroll = false,
  onScroll,
}: PropsWithChildren<ScrollingContentViewProps>) => {
  const style = {
    ...commonStyles.flex,
    ...(isStack ? null : commonStyles.marginTop),
    ...(overScroll ? commonStyles.overscroll : commonStyles.marginBottom),
  };

  return (
    <ScrollView refreshControl={refreshControl} onScroll={onScroll}>
      <View style={style}>{children}</View>
    </ScrollView>
  );
};
