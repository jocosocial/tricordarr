import React, {forwardRef, PropsWithChildren} from 'react';
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  RefreshControlProps,
  ScrollView,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';

import {useStyles} from '#src/Context/Contexts/StyleContext';

interface ScrollingContentViewProps {
  isStack?: boolean;
  refreshControl?: React.ReactElement<RefreshControlProps> | undefined;
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
export const ScrollingContentView = forwardRef<ScrollView, PropsWithChildren<ScrollingContentViewProps>>(
  ({children, isStack = false, refreshControl, overScroll = false, onScroll, style}, ref) => {
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
      <ScrollView
        ref={ref}
        refreshControl={refreshControl}
        onScroll={onScroll}
        // 202561116 I don't remember what this was for or why it was disabled.
        // keyboardShouldPersistTaps="handled"
        // contentInsetAdjustmentBehavior="automatic"
        // automaticallyAdjustKeyboardInsets={isIOS}>
        automaticallyAdjustKeyboardInsets={true}>
        <View style={styles.scrollView}>{children}</View>
      </ScrollView>
    );
  },
);
