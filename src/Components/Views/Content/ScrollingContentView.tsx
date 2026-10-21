import React, {forwardRef, PropsWithChildren} from 'react';
import {
  LayoutChangeEvent,
  NativeScrollEvent,
  NativeSyntheticEvent,
  RefreshControlProps,
  ScrollView,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import {KeyboardAwareScrollView, KeyboardAwareScrollViewRef} from 'react-native-keyboard-controller';

import {useStyles} from '#src/Context/Contexts/StyleContext';

interface ScrollingContentViewProps {
  isStack?: boolean;
  refreshControl?: React.ReactElement<RefreshControlProps> | undefined;
  // Put a big margin at the bottom in case there's a FAB covering up View contents
  // that we care about.
  overScroll?: boolean;
  onScroll?: ((event: NativeSyntheticEvent<NativeScrollEvent>) => void) | undefined;
  onLayout?: ((event: LayoutChangeEvent) => void) | undefined;
  style?: StyleProp<ViewStyle>;
  /** Extra clearance between the focused input's caret and the keyboard. Defaults to styleDefaults.marginSize. */
  bottomOffset?: number;
}

/**
 * View container for app content that scrolls. Also do some formatting to look good.
 * Accepts a single element as a child.
 *
 * Keyboard avoidance (issue #573): this used to sit inside a global
 * KeyboardAvoidingView in AppView, plus its own `automaticallyAdjustKeyboardInsets`
 * — two systems compensating for the same keyboard on iOS. Now that the global KAV
 * is gone, this renders `KeyboardAwareScrollView` directly, which is why
 * `automaticallyAdjustKeyboardInsets` was removed: stacking it back on top of
 * KeyboardAwareScrollView would double the scroll distance again.
 */
export const ScrollingContentView = forwardRef<ScrollView, PropsWithChildren<ScrollingContentViewProps>>(
  ({children, isStack = false, refreshControl, overScroll = false, onScroll, onLayout, style, bottomOffset}, ref) => {
    const {commonStyles, styleDefaults} = useStyles();

    const styles = StyleSheet.create({
      scrollView: {
        ...commonStyles.flex,
        ...(isStack ? null : commonStyles.marginTop),
        ...(overScroll ? commonStyles.overscroll : commonStyles.marginBottom),
        ...(style as ViewStyle),
      },
    });

    return (
      <KeyboardAwareScrollView
        ref={ref as React.Ref<KeyboardAwareScrollViewRef>}
        refreshControl={refreshControl}
        onScroll={onScroll}
        // 202561116 I don't remember what this was for or why it was disabled.
        // 20260823 Login: finishing the password and tapping Login dismissed the
        // keyboard without firing the button (ScrollView default is "never").
        // Forgot Password and other form screens in this view have the same miss.
        keyboardShouldPersistTaps={'handled'}
        bottomOffset={bottomOffset ?? styleDefaults.marginSize}
        scrollsToTop={false}>
        <View style={styles.scrollView} onLayout={onLayout}>
          {children}
        </View>
      </KeyboardAwareScrollView>
    );
  },
);
