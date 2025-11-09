import React, {PropsWithChildren, ReactNode, useEffect, useRef, useState} from 'react';
import {Dimensions, NativeScrollEvent, NativeSyntheticEvent, ScrollView, StyleSheet, View} from 'react-native';
import {Menu} from 'react-native-paper';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {MenuScrollIndicator} from '#src/Components/Views/MenuScrollIndicator';
import {useStyles} from '#src/Context/Contexts/StyleContext';

interface HeaderMenuProps extends PropsWithChildren {
  visible: boolean;
  anchor: ReactNode;
  onDismiss?: () => void;
}

export const AppHeaderMenu = ({visible, anchor, onDismiss, children}: HeaderMenuProps) => {
  const {commonStyles} = useStyles();
  const insets = useSafeAreaInsets();
  const screenHeight = Dimensions.get('window').height;
  const [contentHeight, setContentHeight] = useState(0);
  const [scrollY, setScrollY] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);
  // The 80 is somewhat arbitrary.
  const maxMenuHeight = screenHeight - insets.top - insets.bottom - 80;

  const isScrollable = contentHeight > maxMenuHeight;
  const showIndicator = isScrollable && scrollY < 10; // Hide indicator after scrolling down a bit

  // Reset scroll position when menu opens
  useEffect(() => {
    if (visible) {
      setScrollY(0);
      scrollViewRef.current?.scrollTo({y: 0, animated: false});
    }
  }, [visible]);

  const styles = StyleSheet.create({
    menu: {
      ...commonStyles.safeMarginTop,
      ...commonStyles.safeMarginBottom,
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

  return (
    <Menu
      visible={visible}
      onDismiss={onDismiss}
      anchor={anchor}
      style={styles.menu}
      keyboardShouldPersistTaps={'handled'}>
      <View style={styles.scrollViewContainer}>
        <ScrollView
          ref={scrollViewRef}
          style={styles.scrollView}
          keyboardShouldPersistTaps={'handled'}
          scrollEnabled={isScrollable}
          onContentSizeChange={(_, height) => setContentHeight(height)}
          onScroll={(event: NativeSyntheticEvent<NativeScrollEvent>) => {
            setScrollY(event.nativeEvent.contentOffset.y);
          }}
          scrollEventThrottle={16}>
          {children}
        </ScrollView>
        <MenuScrollIndicator visible={showIndicator} />
      </View>
    </Menu>
  );
};
