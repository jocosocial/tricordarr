import React, {useCallback, useMemo} from 'react';
import {StyleSheet, TouchableOpacity} from 'react-native';
import Animated, {type SharedValue, useAnimatedStyle} from 'react-native-reanimated';

import {useStyles} from '#src/Context/Contexts/StyleContext';
import {useAppTheme} from '#src/Context/Contexts/ThemeContext';

// Reanimated's own Animated.Text, NOT createAnimatedComponent(Paper's Text): Paper's Text
// replaces its instance with a bare {setNativeProps} object via useImperativeHandle, which has no
// fiber for Reanimated's findHostInstance to resolve ("Argument appears to not be a
// ReactComponent"). Paper's `variant` prop is only theme.fonts[variant] prepended to the style,
// so applying the font directly gives the same result.

interface ScheduleHeaderButtonProps {
  /**
   * The currently selected cruise day, held as a shared value so the highlight is resolved on the
   * UI thread and flips as soon as a pager drag passes the halfway point, rather than waiting for
   * JS to commit the new day. The flip is a hard switch - no crossfade, no intermediate colour.
   */
  liveSelectedDay: SharedValue<number>;
  /** This button's own cruise day (0 = All Days). */
  cruiseDay: number;
  /** Stable across renders so this component's React.memo actually holds. */
  onSelect: (cruiseDay: number) => void;
  disabled?: boolean;
  primaryText: string;
  secondaryText: string;
  underlinePrimary?: boolean;
  testID: string;
}

/**
 * Shared base component for schedule header buttons (day buttons and "All Days" button).
 */
const ScheduleHeaderButtonComponent = (props: ScheduleHeaderButtonProps) => {
  const {commonStyles} = useStyles();
  const {theme} = useAppTheme();
  const {liveSelectedDay, cruiseDay} = props;

  const styles = useMemo(
    () =>
      StyleSheet.create({
        view: {
          ...commonStyles.roundedBorderLarge,
          ...commonStyles.justifyCenter,
          ...commonStyles.alignItemsCenter,
          ...commonStyles.paddingHorizontalSmall,
          ...commonStyles.paddingVerticalSmall,
          minWidth: 68, // Approximate height to make button square-ish
        },
        primaryText: {
          ...commonStyles.bold,
          ...(props.underlinePrimary ? commonStyles.underline : undefined),
        },
        secondaryText: {},
        buttonContainer: {
          ...commonStyles.paddingHorizontalTiny,
        },
      }),
    [commonStyles, props.underlinePrimary],
  );

  const selectedBackgroundColor = theme.colors.inverseSurface;
  const unselectedBackgroundColor = theme.colors.inverseOnSurface;
  // Text inverts against whichever background it is sitting on.
  const selectedTextColor = theme.colors.inverseOnSurface;
  const unselectedTextColor = theme.colors.inverseSurface;

  // liveSelectedDay is already a whole day, so exactly one chip matches at any moment and the
  // swap happens the instant a drag crosses halfway - no transient state on the chip left behind.
  const animatedViewStyle = useAnimatedStyle(() => {
    return {
      backgroundColor: liveSelectedDay.value === cruiseDay ? selectedBackgroundColor : unselectedBackgroundColor,
    };
  });

  const animatedTextStyle = useAnimatedStyle(() => {
    return {
      color: liveSelectedDay.value === cruiseDay ? selectedTextColor : unselectedTextColor,
    };
  });

  const onSelect = props.onSelect;
  const handlePress = useCallback(() => onSelect(cruiseDay), [onSelect, cruiseDay]);

  return (
    <TouchableOpacity
      testID={props.testID}
      style={styles.buttonContainer}
      onPress={handlePress}
      disabled={props.disabled}
      activeOpacity={1}>
      <Animated.View style={[styles.view, animatedViewStyle]}>
        <Animated.Text style={[theme.fonts.titleLarge, styles.primaryText, animatedTextStyle]}>
          {props.primaryText}
        </Animated.Text>
        <Animated.Text style={[theme.fonts.bodyMedium, styles.secondaryText, animatedTextStyle]}>
          {props.secondaryText}
        </Animated.Text>
      </Animated.View>
    </TouchableOpacity>
  );
};

export const ScheduleHeaderButton = React.memo(ScheduleHeaderButtonComponent);
