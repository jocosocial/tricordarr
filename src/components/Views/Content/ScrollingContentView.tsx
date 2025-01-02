import React, {PropsWithChildren, ReactElement} from 'react';
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleProp,
  View,
  ViewStyle,
  StyleSheet,
} from 'react-native';
import {useStyles} from '../../Context/Contexts/StyleContext.ts';

interface ScrollingContentViewProps {
  isStack?: boolean;
  refreshControl?: ReactElement;
  // Put a big margin at the bottom in case there's a FAB covering up View contents
  // that we care about.
  overScroll?: boolean;
  onScroll?: ((event: NativeSyntheticEvent<NativeScrollEvent>) => void) | undefined;
  style?: StyleProp<ViewStyle>;
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
  style,
}: PropsWithChildren<ScrollingContentViewProps>) => {
  const {commonStyles} = useStyles();
  const styles = StyleSheet.create({
    scrollView: {
      ...commonStyles.flex,
      ...(isStack ? null : commonStyles.marginTop),
      ...(overScroll ? commonStyles.overscroll : commonStyles.marginBottom),
      ...(style as ViewStyle),
    },
  });

  return (
    <ScrollView refreshControl={refreshControl} onScroll={onScroll}>
      <View style={styles.scrollView}>{children}</View>
    </ScrollView>
  );
};
