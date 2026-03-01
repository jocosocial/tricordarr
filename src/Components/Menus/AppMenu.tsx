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
  const [scrollY, setScrollY] = useState(0);
  const [isAtBottom, setIsAtBottom] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const containerRef = useRef<View>(null);

  // Calculate max height as a percentage of screen height
  const calculateMaxHeight = () => {
    return screenHeight * 0.5; // 50% of screen height
  };

  const maxMenuHeight = calculateMaxHeight();

  const isScrollable = contentHeight > maxMenuHeight;
  // Hide indicator when scrolled down OR when at bottom of content.
  // The isAtBottom check is necessary because on small devices, the total scrollable distance
  // may be less than 10 pixels. Without this check, the indicator would never hide.
  // Note: MenuScrollIndicator uses absolute positioning to prevent a flickering feedback loop.
  // If it were in the flex layout, showing/hiding it would change the ScrollView's available
  // height, which changes the scroll offset, which toggles the indicator again rapidly.
  //
  // This was all due to small iOS devices being weird with scrolling to the bottom.
  const showIndicator = isScrollable && scrollY < 10 && !isAtBottom;

  // Reset scroll position when menu opens
  useEffect(() => {
    if (visible) {
      setScrollY(0);
      setIsAtBottom(false);
      scrollViewRef.current?.scrollTo({y: 0, animated: false});
    }
  }, [visible]);

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
    const newScrollY = event.nativeEvent.contentOffset.y;
    const {contentSize, layoutMeasurement} = event.nativeEvent;
    const maxScrollY = contentSize.height - layoutMeasurement.height;
    const atBottom = newScrollY >= maxScrollY - 5;
    setScrollY(newScrollY);
    setIsAtBottom(atBottom);
    // Call the original onScroll handler if provided
    if (onScroll) {
      onScroll(event);
    }
  };

  const scrollToBottom = () => {
    scrollViewRef.current?.scrollToEnd({animated: false});
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
      <View ref={containerRef} style={styles.scrollViewContainer}>
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
        <MenuScrollIndicator visible={showIndicator} onPress={scrollToBottom} />
      </View>
    </Menu>
  );
};
