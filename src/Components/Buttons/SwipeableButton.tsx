import React, {useCallback, useMemo, useState} from 'react';
import {LayoutChangeEvent, StyleProp, StyleSheet, TextStyle, ViewStyle} from 'react-native';
import {RectButton} from 'react-native-gesture-handler';
import {ActivityIndicator, Text} from 'react-native-paper';

import {AppIcon} from '#src/Components/Icons/AppIcon';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {useAppTheme} from '#src/Context/Contexts/ThemeContext';

interface SwipeableButtonProps {
  onPress?: () => void;
  iconName?: string;
  text?: string;
  textStyle?: StyleProp<TextStyle>;
  style?: StyleProp<ViewStyle>;
  refreshing?: boolean;
  iconStyle?: StyleProp<ViewStyle>;
  iconColor?: string;
  disabled?: boolean;
  testID: string;
}

export const SwipeableButton = (props: SwipeableButtonProps) => {
  const {commonStyles} = useStyles();
  const {theme} = useAppTheme();
  // The button stretches to the swiped row's height (the actions panel's default cross-axis
  // stretch), which varies by list. A short icon+word button (e.g. "Call") would otherwise
  // render narrower than it is tall, so measure that height and floor the width at it to keep
  // a minimum square aspect ratio. minWidth still lets longer text (e.g. "Seamail") grow wider.
  const [minWidth, setMinWidth] = useState<number>();

  const handleLayout = useCallback((event: LayoutChangeEvent) => {
    const {height} = event.nativeEvent.layout;
    setMinWidth(prev => (prev === height ? prev : height));
  }, []);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        button: {
          ...commonStyles.justifyCenter,
          ...commonStyles.paddingHorizontalSmall,
          ...commonStyles.alignItemsCenter,
          ...(minWidth !== undefined ? {minWidth} : {}),
          ...(props.style as object),
        },
        text: {
          ...commonStyles.bold,
          color: props.disabled ? theme.colors.onSurfaceDisabled : theme.colors.onBackground,
          ...(props.textStyle as object),
        },
        icon: {
          color: props.disabled ? theme.colors.onSurfaceDisabled : props.iconColor || theme.colors.onBackground,
        },
      }),
    [commonStyles, theme, minWidth, props.style, props.textStyle, props.disabled, props.iconColor],
  );
  return (
    <RectButton
      testID={props.testID}
      style={styles.button}
      onLayout={handleLayout}
      onPress={props.onPress}
      enabled={!props.disabled}>
      {props.refreshing ? (
        <ActivityIndicator color={props.iconColor} />
      ) : (
        props.iconName && <AppIcon icon={props.iconName} color={styles.icon.color} />
      )}
      {props.text && <Text style={styles.text}>{props.text}</Text>}
    </RectButton>
  );
};
