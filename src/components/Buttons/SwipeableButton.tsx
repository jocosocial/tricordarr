import React from 'react';
import {StyleProp, TextStyle, ViewStyle, StyleSheet} from 'react-native';
import {ActivityIndicator, Text} from 'react-native-paper';
import {AppIcon} from '../Icons/AppIcon.tsx';
import {RectButton} from 'react-native-gesture-handler';
import {useStyles} from '../Context/Contexts/StyleContext.ts';
import {useAppTheme} from '../../Styles/Theme.ts';

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
}

export const SwipeableButton = (props: SwipeableButtonProps) => {
  const {commonStyles} = useStyles();
  const theme = useAppTheme();
  const styles = StyleSheet.create({
    button: {
      ...commonStyles.justifyCenter,
      ...commonStyles.paddingHorizontal,
      ...commonStyles.alignItemsCenter,
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
  });
  return (
    <RectButton style={styles.button} onPress={props.onPress} enabled={!props.disabled}>
      {props.refreshing ? (
        <ActivityIndicator color={props.iconColor} />
      ) : (
        props.iconName && <AppIcon icon={props.iconName} color={styles.icon.color} />
      )}
      {props.text && <Text style={styles.text}>{props.text}</Text>}
    </RectButton>
  );
};
