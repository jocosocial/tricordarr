import {StyleSheet} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Animated, {type SharedValue, useAnimatedStyle} from 'react-native-reanimated';

const GRADIENT_WIDTH = 24;

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

/**
 * A gradient shadow indicator for horizontal scroll containers.
 * Shows a dark-to-transparent gradient on the specified side to indicate scrollability.
 */
export const ScrollShadowView = ({side, opacity}: ScrollShadowViewProps) => {
  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  // Gradient colors from dark to transparent
  const colors = ['rgba(0, 0, 0, 0.48)', 'rgba(0, 0, 0, 0)'];
  // For left shadow: dark on left, transparent on right
  // For right shadow: transparent on left, dark on right
  const gradientColors = side === 'left' ? colors : [...colors].reverse();

  return (
    <Animated.View style={[styles.base, styles[side], animatedStyle]} pointerEvents={'none'}>
      <LinearGradient colors={gradientColors} start={{x: 0, y: 0}} end={{x: 1, y: 0}} style={StyleSheet.absoluteFill} />
    </Animated.View>
  );
};
