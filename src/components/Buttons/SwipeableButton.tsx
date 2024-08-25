import React from 'react';
import {StyleProp, TextStyle, ViewStyle, StyleSheet} from 'react-native';
import {Text} from 'react-native-paper';
import {AppIcon} from '../Icons/AppIcon.tsx';
import {RectButton} from 'react-native-gesture-handler';
import {useStyles} from '../Context/Contexts/StyleContext.ts';

interface SwipeableButtonProps {
  onPress?: () => void;
  iconName?: string;
  text?: string;
  textStyle?: StyleProp<TextStyle>;
  style?: StyleProp<ViewStyle>;
}

export const SwipeableButton = (props: SwipeableButtonProps) => {
  const {commonStyles} = useStyles();
  const styles = StyleSheet.create({
    button: {
      ...commonStyles.justifyCenter,
      ...commonStyles.paddingHorizontal,
      ...commonStyles.alignItemsCenter,
      ...(props.style as object),
    },
    text: {
      ...commonStyles.bold,
      ...(props.textStyle as object),
    },
  });
  return (
    <RectButton style={styles.button} onPress={props.onPress}>
      {props.iconName && <AppIcon icon={props.iconName} />}
      {props.text && <Text style={styles.text}>{props.text}</Text>}
    </RectButton>
  );
};
