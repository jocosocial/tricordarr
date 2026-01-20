import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {
  Dimensions,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  ScrollViewProps,
  StyleSheet,
  View,
} from 'react-native';
import {Menu, MenuProps} from 'react-native-paper';

import {MenuScrollIndicator} from '#src/Components/Views/MenuScrollIndicator';
import {useStyles} from '#src/Context/Contexts/StyleContext';

/**
 * Extended MenuProps that includes onScroll (added via patch to react-native-paper)
 */
export interface AppMenuProps extends MenuProps {
  onScroll?: ScrollViewProps['onScroll'];
  header?: React.ReactElement | (() => React.ReactElement);
}

/**
 * A generic wrapper around react-native-paper Menu that handles screen clipping issues
 * by calculating appropriate max heights and providing scroll indicators.
 * This is a drop-in replacement for Menu.
 */
export const AppMenu = ({visible, children, onScroll, style, header, ...menuProps}: AppMenuProps) => {
  const {commonStyles} = useStyles();
  const screenHeight = Dimensions.get('window').height;
  const [contentHeight, setContentHeight] = useState(0);
  const [showIndicator, setShowIndicator] = useState(false);
  const scrollYRef = useRef(0);
  const showIndicatorRef = useRef(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const containerRef = useRef<View>(null);
  const indicatorUpdateTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Calculate max height as a percentage of screen height
  const calculateMaxHeight = () => {
    return screenHeight * 0.5; // 50% of screen height
  };

  const maxMenuHeight = calculateMaxHeight();

  const isScrollable = contentHeight > maxMenuHeight;

  // Reset scroll position when menu opens
  useEffect(() => {
    if (visible) {
      scrollYRef.current = 0;
      showIndicatorRef.current = false;
      setShowIndicator(false);
      scrollViewRef.current?.scrollTo({y: 0, animated: false});
    }
  }, [visible]);

  // Memoize styles to prevent creating new style objects on every render
  const styles = useMemo(
    () =>
      StyleSheet.create({
        menu: {
          ...commonStyles.safeMarginTop,
          ...commonStyles.safeMarginBottom,
          ...(style as object),
        },
        scrollViewContainer: {
          position: 'relative',
          maxHeight: maxMenuHeight,
        },
        scrollView: {
          // Calculate max height: screen height minus top safe area, bottom safe area, and some padding
          // This ensures the menu doesn't extend beyond the screen bounds
          maxHeight: maxMenuHeight,
        },
      }),
    [commonStyles.safeMarginTop, commonStyles.safeMarginBottom, style, maxMenuHeight],
  );

  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const newScrollY = event.nativeEvent.contentOffset.y;
      scrollYRef.current = newScrollY;
      // Update ref immediately without state updates to prevent re-renders
      const shouldShowIndicator = isScrollable && newScrollY < 10;
      showIndicatorRef.current = shouldShowIndicator;
      // Only update state when crossing threshold, debounced to prevent rapid toggling
      if (shouldShowIndicator !== showIndicator) {
        // Clear any pending update
        if (indicatorUpdateTimeoutRef.current) {
          clearTimeout(indicatorUpdateTimeoutRef.current);
        }
        // Debounce state update to prevent rapid re-renders during scroll
        indicatorUpdateTimeoutRef.current = setTimeout(() => {
          setShowIndicator(shouldShowIndicator);
        }, 100);
      }
      // Call the original onScroll handler if provided
      if (onScroll) {
        onScroll(event);
      }
    },
    [onScroll, isScrollable, showIndicator],
  );

  // Render header component or call header function
  const renderHeader = () => {
    if (!header) return null;
    return typeof header === 'function' ? header() : header;
  };

  return (
    <Menu
      visible={visible}
      style={styles.menu}
      keyboardShouldPersistTaps={menuProps.keyboardShouldPersistTaps || 'handled'}
      {...menuProps}>
      <View ref={containerRef} style={styles.scrollViewContainer}>
        {renderHeader()}
        <ScrollView
          ref={scrollViewRef}
          style={styles.scrollView}
          keyboardShouldPersistTaps={menuProps.keyboardShouldPersistTaps || 'handled'}
          scrollEnabled={isScrollable}
          onContentSizeChange={(_, height) => {
            setContentHeight(height);
          }}
          onScroll={handleScroll}
          scrollEventThrottle={16}>
          {children}
        </ScrollView>
        <MenuScrollIndicator visible={isScrollable && scrollYRef.current < 10} />
      </View>
    </Menu>
  );
};
