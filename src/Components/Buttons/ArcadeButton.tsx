import React, {useCallback, useEffect, useRef, useState} from 'react';
import {Animated, GestureResponderEvent, StyleSheet, TouchableWithoutFeedback, View} from 'react-native';

/**
 * This component was lifted from:
 * https://github.com/likethemammal/react-native-arcade-button
 */

const colors = {
  offwhite: '#eeeeee',
  alto: '#dddddd',
  silver: '#cccccc',
  silver_dark: '#bbbbbb',
  dusty_gray: '#999999',
  gray: '#888888',
  emperor: '#555555',
  mine_shaft: '#222222',
};

const reflectionColor = 'rgba(255,255,255,0.35)';
const shadowColor = 'rgba(0,0,0,0.1)';
const shadowColorDark = 'rgba(0,0,0,0.15)';
const bottomShadowColor = colors.silver;

interface ArcadeButtonProps {
  color?: string;
  disabled?: boolean;
  children?: React.ReactNode;
  onPressIn?: (e: GestureResponderEvent) => void;
  onPressOut?: (e: GestureResponderEvent) => void;
  onDisabledOut?: (e: GestureResponderEvent) => void;
}

const ArcadeButton = ({
  color = 'hsla(120, 52%, 48%, 1)',
  disabled,
  children,
  onPressIn,
  onPressOut,
  onDisabledOut,
}: ArcadeButtonProps) => {
  const [down, setDown] = useState(false);
  const [amountDown] = useState(() => new Animated.Value(0));
  const animationTimerRef = useRef<Animated.CompositeAnimation | null>(null);

  const handlePressIn = useCallback(
    (e: GestureResponderEvent): void => {
      if (down) {
        return;
      }

      setDown(true);

      if (disabled) {
        return;
      }

      animationTimerRef.current = Animated.timing(amountDown, {
        toValue: 1,
        delay: 0,
        duration: 42,
        useNativeDriver: false,
      });

      animationTimerRef.current.start();

      if (onPressIn) {
        onPressIn(e);
      }
    },
    [down, disabled, amountDown, onPressIn],
  );

  const handlePressOut = useCallback(
    (e: GestureResponderEvent): void => {
      setDown(false);

      if (disabled) {
        if (onDisabledOut) onDisabledOut(e);
        return;
      }

      //react native doesnt accept the value being reset to a new value of zero
      amountDown.setValue(0);

      if (onPressOut) {
        onPressOut(e);
      }
    },
    [disabled, amountDown, onPressOut, onDisabledOut],
  );

  useEffect(() => {
    /* istanbul ignore next */
    amountDown.setValue(disabled ? 0 : 1);
  }, [disabled, amountDown]);

  const topDepressed = {
    transform: [
      {
        translateY: amountDown.interpolate({
          inputRange: [0, 1],
          outputRange: [0, 2],
        }),
      },
    ],
    zIndex: 1,
    opacity: amountDown.interpolate({
      inputRange: [0, 1],
      outputRange: [1, 0.8],
    }),
  };

  const disabledStylesApplied = disabled && disabledStyles;

  const topFlat = {
    backgroundColor: color,
    borderColor: color,
  };
  const bottomFlat = {
    backgroundColor: color,
  };
  const bottomRim = {
    backgroundColor: color,
  };

  return (
    <View style={styles.container}>
      <View style={styles.bottom}>
        <View style={[styles.bottomShadowUnder, disabledStylesApplied && disabledStyles.bottomShadowUnder]} />
        <View style={[styles.bottomRim, bottomRim, disabledStylesApplied && disabledStyles.bottomFlat]} />
        <View style={[styles.bottomShadow, disabledStylesApplied && disabledStyles.bottomShadow]} />
        <View style={[styles.bottomFlat, bottomFlat, disabledStylesApplied && disabledStyles.bottomFlat]} />
        <View style={[styles.bottomFlatOverlay]} />
      </View>

      <View style={styles.top}>
        <View style={[styles.topShadow, disabledStylesApplied && disabledStyles.topShadow]} />

        <Animated.View style={topDepressed}>
          <View style={[styles.topReflection, disabledStylesApplied && disabledStyles.topReflection]} />

          <TouchableWithoutFeedback onPressIn={handlePressIn} onPressOut={handlePressOut}>
            <View style={[styles.topFlat, topFlat, disabledStylesApplied && disabledStyles.topFlat]}>{children}</View>
          </TouchableWithoutFeedback>
        </Animated.View>
      </View>
    </View>
  );
};

export default ArcadeButton;

const disabledStyles = StyleSheet.create({
  topFlat: {
    backgroundColor: colors.silver_dark,
    borderColor: colors.silver_dark,
  },
  topReflection: {
    backgroundColor: bottomShadowColor,
  },
  bottomFlat: {
    borderColor: bottomShadowColor,
    backgroundColor: colors.silver_dark,
  },
  topShadow: {
    borderColor: colors.gray,
    backgroundColor: colors.dusty_gray,
  },
  bottomShadow: {
    backgroundColor: colors.dusty_gray,
  },
  bottomShadowUnder: {
    backgroundColor: bottomShadowColor,
  },
});

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    position: 'relative',
    top: 3,
    width: 220,
    height: 220,
  },
  top: {
    position: 'relative',
    top: -3,
  },
  topFlat: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 150,
    height: 150,
    marginTop: 3,
    borderRadius: 75,
    borderWidth: 1,
  },
  topShadow: {
    position: 'absolute',
    width: 150,
    height: 150,
    marginTop: 7,
    borderRadius: 75,
    borderColor: shadowColorDark,
    borderWidth: 1,
    backgroundColor: shadowColor,
  },
  topReflection: {
    position: 'absolute',
    width: 150,
    height: 150,
    marginTop: 1,
    borderRadius: 75,
    backgroundColor: reflectionColor,
  },
  topDepressed: {},
  bottom: {
    position: 'relative',
    marginBottom: -175,
  },
  bottomFlat: {
    width: 200,
    height: 200,
    marginTop: 5,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: reflectionColor,
  },
  bottomRim: {
    position: 'absolute',
    top: 8,
    width: 200,
    height: 200,
    borderRadius: 100,
  },
  bottomFlatOverlay: {
    position: 'absolute',
    width: 200,
    height: 200,
    marginTop: 5,
    borderRadius: 100,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  bottomShadow: {
    position: 'absolute',
    top: 8,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: shadowColor,
  },
  bottomShadowUnder: {
    position: 'absolute',
    top: -3,
    left: -10,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: bottomShadowColor,
    opacity: 0.1,
  },
});
