import {useCallback} from 'react';
import {interpolateColor, useAnimatedStyle, useSharedValue, withSequence, withTiming} from 'react-native-reanimated';
import {scheduleOnRN} from 'react-native-worklets';

import {useAppTheme} from '#src/Context/Contexts/ThemeContext';

interface UseHighlightAnimationOptions {
  onComplete?: () => void;
}

interface UseHighlightAnimationResult {
  triggerPulseAnimation: () => void;
  pulseAnimatedStyle: ReturnType<typeof useAnimatedStyle>;
}

/**
 * Hook to manage highlight pulse animation with theme-aware colors.
 * Provides a pulse animation that runs twice after being triggered.
 *
 * This will not appear if you have Animations disabled on your device. Which
 * honestly should be the default, holy fuck Android feels so slow with them on.
 *
 * @param onComplete - Callback to execute after the pulse animation completes
 * @returns Object containing triggerPulseAnimation function and pulseAnimatedStyle
 */
export const useHighlightAnimation = ({onComplete}: UseHighlightAnimationOptions): UseHighlightAnimationResult => {
  const {isDarkMode} = useAppTheme();
  const pulseOpacity = useSharedValue(0);

  // Calculate theme-aware colors for pulse animation
  // Dark mode: white-ish color, Light mode: grey/black-ish color
  const pulseBaseColor = isDarkMode ? 'rgba(255, 255, 255, 0)' : 'rgba(0, 0, 0, 0)';
  const pulseColor = isDarkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)';

  const triggerPulseAnimation = useCallback(() => {
    // Two pulses: fade in → fade out, then fade in → fade out again
    // Each fade is 175ms, with no delay between pulses
    pulseOpacity.value = withSequence(
      withTiming(1, {duration: 175}), // First pulse: fade in
      withTiming(0, {duration: 175}), // First pulse: fade out
      withTiming(0, {duration: 0}), // Delay between pulses
      withTiming(1, {duration: 175}), // Second pulse: fade in
      withTiming(0, {
        duration: 175,
        // Call onComplete when the animation actually finishes
        ...(onComplete && {
          callback: (finished: boolean) => {
            if (finished) {
              scheduleOnRN(() => {
                onComplete();
              });
            }
          },
        }),
      }), // Second pulse: fade out
    );
  }, [onComplete, pulseOpacity]);

  // Animated style for pulse effect with theme-aware colors
  const pulseAnimatedStyle = useAnimatedStyle(() => {
    // Interpolate from transparent to pulse color based on pulseOpacity
    return {
      backgroundColor: interpolateColor(pulseOpacity.value, [0, 1], [pulseBaseColor, pulseColor]),
    };
  });

  return {
    triggerPulseAnimation,
    pulseAnimatedStyle,
  };
};
