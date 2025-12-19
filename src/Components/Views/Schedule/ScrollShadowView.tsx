import {NativeScrollEvent, NativeSyntheticEvent} from 'react-native';
import {StyleSheet} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Animated, {type SharedValue, useAnimatedStyle, useSharedValue, withTiming} from 'react-native-reanimated';

import {useAppTheme} from '#src/Context/Contexts/ThemeContext';

const GRADIENT_WIDTH = 80;
const SHADOW_OPACITY = 1;
const SCROLL_THRESHOLD = 5;
const ANIMATION_DURATION = 150;

const styles = StyleSheet.create({
  base: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: GRADIENT_WIDTH,
    zIndex: 1,
  },
  left: {
    left: 0,
  },
  right: {
    right: 0,
  },
});

interface ScrollShadowViewProps {
  side: 'left' | 'right';
  opacity: SharedValue<number>;
}

interface UseScrollShadowResult {
  leftShadowOpacity: SharedValue<number>;
  rightShadowOpacity: SharedValue<number>;
  handleScroll: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
}

/**
 * Hook to manage scroll shadow opacity based on scroll position.
 * Returns shared values for left/right shadow opacity and a scroll handler.
 */
export const useScrollShadow = (): UseScrollShadowResult => {
  const leftShadowOpacity = useSharedValue(0);
  const rightShadowOpacity = useSharedValue(1);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const {contentOffset, contentSize, layoutMeasurement} = event.nativeEvent;
    const maxScrollX = contentSize.width - layoutMeasurement.width;

    // Show left shadow when not at the start
    const showLeftShadow = contentOffset.x > SCROLL_THRESHOLD;
    leftShadowOpacity.value = withTiming(showLeftShadow ? 1 : 0, {duration: ANIMATION_DURATION});

    // Show right shadow when not at the end
    const showRightShadow = contentOffset.x < maxScrollX - SCROLL_THRESHOLD;
    rightShadowOpacity.value = withTiming(showRightShadow ? 1 : 0, {duration: ANIMATION_DURATION});
  };

  return {
    leftShadowOpacity,
    rightShadowOpacity,
    handleScroll,
  };
};

/**
 * A gradient shadow indicator for horizontal scroll containers.
 * Shows a dark-to-transparent gradient on the specified side to indicate scrollability.
 */
export const ScrollShadowView = ({side, opacity}: ScrollShadowViewProps) => {
  const {theme} = useAppTheme();
  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  // Convert background color from 'rgb(r, g, b)' to 'rgba(r, g, b, opacity)'
  // Use the same color with different alpha values for proper gradient fade
  const shadowColor = theme.colors.background.replace('rgb(', `rgba(`).replace(')', `, ${SHADOW_OPACITY})`);
  const transparentColor = theme.colors.background.replace('rgb(', `rgba(`).replace(')', ', 0)');

  // Gradient colors from background color (with opacity) to background color (fully transparent)
  const colors = [shadowColor, transparentColor];
  // For left shadow: dark on left, transparent on right
  // For right shadow: transparent on left, dark on right
  const gradientColors = side === 'left' ? colors : [...colors].reverse();

  return (
    <Animated.View style={[styles.base, styles[side], animatedStyle]} pointerEvents={'none'}>
      <LinearGradient colors={gradientColors} start={{x: 0, y: 0}} end={{x: 1, y: 0}} style={StyleSheet.absoluteFill} />
    </Animated.View>
  );
};
