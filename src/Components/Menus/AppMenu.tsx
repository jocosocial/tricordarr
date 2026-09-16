import React, {createContext, useCallback, useContext, useEffect, useMemo, useRef, useState} from 'react';
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

interface AppMenuItemLayout {
  y: number;
  height: number;
  selected: boolean;
}

interface AppMenuScrollContextType {
  registerItem: (id: string, layout: AppMenuItemLayout) => void;
  unregisterItem: (id: string) => void;
}

/**
 * Lets SelectableMenuItem report its layout up to the enclosing AppMenu so the menu can
 * scroll to a selected item on open. No-op outside an AppMenu (e.g. a plain Paper Menu).
 */
export const AppMenuScrollContext = createContext<AppMenuScrollContextType>({
  registerItem: () => {},
  unregisterItem: () => {},
});

export const useAppMenuScroll = () => useContext(AppMenuScrollContext);

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
  const itemLayoutsRef = useRef(new Map<string, AppMenuItemLayout>());
  const pendingAutoScrollRef = useRef(false);

  // Calculate max height as a percentage of screen height
  const calculateMaxHeight = () => {
    return screenHeight * 0.5; // 50% of screen height
  };

  const maxMenuHeight = calculateMaxHeight();

  const isScrollable = contentHeight > maxMenuHeight;
  // Bottom indicator: show while resting near the top and not already at the bottom.
  // Top indicator: the mirror image, shown while resting near the bottom and not already at
  // the top. Since menus can now open pre-scrolled (to reveal a selected item), the top
  // indicator may be visible immediately on open, not just after the user scrolls down.
  // The isAtBottom check (rather than a raw scrollY comparison) is necessary because on small
  // devices, the total scrollable distance may be less than 10 pixels; without it, the bottom
  // indicator would never hide, and the top indicator would never distinguish "at bottom" from
  // "at top" on such short content.
  // Note: MenuScrollIndicator uses absolute positioning to prevent a flickering feedback loop.
  // If it were in the flex layout, showing/hiding it would change the ScrollView's available
  // height, which changes the scroll offset, which toggles the indicator again rapidly.
  //
  // This was all due to small iOS devices being weird with scrolling to the bottom.
  const isAtTop = scrollY < 10;
  const showBottomIndicator = isScrollable && isAtTop && !isAtBottom;
  const showTopIndicator = isScrollable && isAtBottom && !isAtTop;

  // Reset scroll position when menu opens; applyAutoScroll (triggered by the resulting
  // onContentSizeChange) then overrides it if a selected item needs to be brought into view.
  useEffect(() => {
    if (visible) {
      setScrollY(0);
      setIsAtBottom(false);
      pendingAutoScrollRef.current = true;
      scrollViewRef.current?.scrollTo({y: 0, animated: false});
    }
  }, [visible]);

  const registerItem = useCallback((id: string, layout: AppMenuItemLayout) => {
    itemLayoutsRef.current.set(id, layout);
  }, []);

  const unregisterItem = useCallback((id: string) => {
    itemLayoutsRef.current.delete(id);
  }, []);

  const scrollContextValue = useMemo(() => ({registerItem, unregisterItem}), [registerItem, unregisterItem]);

  // Scroll so the topmost selected item is visible, if the menu opened with a selection
  // that would otherwise be scrolled out of view.
  const applyAutoScroll = (height: number) => {
    if (!pendingAutoScrollRef.current) {
      return;
    }
    pendingAutoScrollRef.current = false;
    if (height <= maxMenuHeight) {
      return;
    }
    let target: AppMenuItemLayout | undefined;
    itemLayoutsRef.current.forEach(layout => {
      if (layout.selected && (!target || layout.y < target.y)) {
        target = layout;
      }
    });
    if (!target) {
      return;
    }
    const maxScrollY = height - maxMenuHeight;
    const idealY = target.y + target.height / 2 - maxMenuHeight / 2;
    const scrollTarget = Math.max(0, Math.min(idealY, maxScrollY));
    scrollViewRef.current?.scrollTo({y: scrollTarget, animated: false});
    setScrollY(scrollTarget);
    setIsAtBottom(scrollTarget >= maxScrollY - 5);
  };

  const styles = StyleSheet.create({
    menu: {
      // Paper positions this container absolutely at the anchor's own top, so the menu would
      // otherwise cover the anchor entirely. Yoga adds margin on top of that computed offset,
      // so a small marginTop nudges the menu down far enough to leave the anchor visible.
      // Keep this a fixed value: using a safe area inset here is what pushed menus far below
      // their anchors, and the maxHeight below is what keeps the menu clear of the system bars.
      ...commonStyles.marginTop,
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

  const scrollToTop = () => {
    scrollViewRef.current?.scrollTo({y: 0, animated: false});
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
      // statusBarHeight became necessary after upgrade to Expo+RN86 due to menus
      // showing up way too low.
      statusBarHeight={0}
      keyboardShouldPersistTaps={menuProps.keyboardShouldPersistTaps || 'handled'}
      {...menuProps}>
      <AppMenuScrollContext.Provider value={scrollContextValue}>
        <View ref={containerRef} style={styles.scrollViewContainer}>
          {renderHeader()}
          <ScrollView
            ref={scrollViewRef}
            style={styles.scrollView}
            keyboardShouldPersistTaps={menuProps.keyboardShouldPersistTaps || 'handled'}
            scrollEnabled={isScrollable}
            onContentSizeChange={(_, height) => {
              setContentHeight(height);
              requestAnimationFrame(() => applyAutoScroll(height));
            }}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            scrollsToTop={false}>
            {children}
          </ScrollView>
          <MenuScrollIndicator visible={showTopIndicator} onPress={scrollToTop} direction={'up'} />
          <MenuScrollIndicator visible={showBottomIndicator} onPress={scrollToBottom} direction={'down'} />
        </View>
      </AppMenuScrollContext.Provider>
    </Menu>
  );
};
