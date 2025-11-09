import React, {useEffect, useRef, useState} from 'react';
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
import {useSafeAreaInsets} from 'react-native-safe-area-context';

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
  const insets = useSafeAreaInsets();
  const screenHeight = Dimensions.get('window').height;
  const [contentHeight, setContentHeight] = useState(0);
  const [scrollY, setScrollY] = useState(0);
  const [menuTop, setMenuTop] = useState<number | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  const containerRef = useRef<View>(null);

  // Calculate max height based on menu position
  // If menu position is known, use available space below the menu (menus typically expand downward)
  // Otherwise, fall back to the original calculation
  const calculateMaxHeight = () => {
    if (menuTop === null) {
      // Fallback: assume menu is at top, leave some padding
      return screenHeight - insets.top - insets.bottom - 80;
    }

    // Calculate available space below the menu position
    // The menu expands downward, so we use the space from menuTop to bottom of screen
    const spaceBelow = screenHeight - menuTop - insets.bottom;
    // Ensure minimum padding and don't allow negative values
    const padding = 40;
    return Math.max(spaceBelow - padding, 100); // Minimum 100px height
  };

  const maxMenuHeight = calculateMaxHeight();

  const isScrollable = contentHeight > maxMenuHeight;
  const showIndicator = isScrollable && scrollY < 10; // Hide indicator after scrolling down a bit

  // Reset scroll position when menu opens
  useEffect(() => {
    if (visible) {
      setScrollY(0);
      scrollViewRef.current?.scrollTo({y: 0, animated: false});
      // Reset menu position measurement when menu opens
      setMenuTop(null);
    }
  }, [visible]);

  // Measure menu container position when it's laid out
  const handleContainerLayout = () => {
    if (visible) {
      // Get absolute position by measuring relative to window
      containerRef.current?.measureInWindow((_x, measuredY) => {
        setMenuTop(measuredY);
      });
    }
  };

  const styles = StyleSheet.create({
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
  });

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    setScrollY(event.nativeEvent.contentOffset.y);
    // Call the original onScroll handler if provided
    if (onScroll) {
      onScroll(event);
    }
  };

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
      <View ref={containerRef} style={styles.scrollViewContainer} onLayout={handleContainerLayout}>
        {renderHeader()}
        <ScrollView
          ref={scrollViewRef}
          style={styles.scrollView}
          keyboardShouldPersistTaps={menuProps.keyboardShouldPersistTaps || 'handled'}
          scrollEnabled={isScrollable}
          onContentSizeChange={(_, height) => setContentHeight(height)}
          onScroll={handleScroll}
          scrollEventThrottle={16}>
          {children}
        </ScrollView>
        <MenuScrollIndicator visible={showIndicator} />
      </View>
    </Menu>
  );
};
