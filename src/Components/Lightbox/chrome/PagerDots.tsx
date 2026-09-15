import {BlurView} from 'expo-blur';
import React from 'react';
import {StyleSheet, View} from 'react-native';

import {useAppTheme} from '#src/Context/Contexts/ThemeContext';

interface PagerDotsProps {
  count: number;
  activeIndex: number;
}

/**
 * Page indicator for multi-image lightboxes. Hidden for a single image.
 */
export const PagerDots = ({count, activeIndex}: PagerDotsProps) => {
  const {theme} = useAppTheme();

  if (count <= 1) {
    return null;
  }

  return (
    <View style={styles.root}>
      <BlurView intensity={20} tint={'dark'} style={styles.inner}>
        {Array.from({length: count}).map((_, i) => {
          const isActive = i === activeIndex;
          return <View key={i} style={isActive ? activeDotStyle(theme.colors.constantWhite) : styles.inactiveDot} />;
        })}
      </BlurView>
    </View>
  );
};

const ACTIVE = 6;
const INACTIVE = 4;
const GAP = 5;

const styles = StyleSheet.create({
  root: {
    borderRadius: 999,
    overflow: 'hidden',
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: GAP,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  inactiveDot: {
    width: INACTIVE,
    height: INACTIVE,
    borderRadius: INACTIVE / 2,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
});

const activeDotStyle = (backgroundColor: string) =>
  StyleSheet.create({
    dot: {
      width: ACTIVE,
      height: ACTIVE,
      borderRadius: ACTIVE / 2,
      backgroundColor,
    },
  }).dot;
