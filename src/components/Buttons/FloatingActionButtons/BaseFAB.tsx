import React from 'react';
import {StyleProp, StyleSheet, ViewStyle} from 'react-native';
import {FAB} from 'react-native-paper';
import {IconSource} from 'react-native-paper/lib/typescript/components/Icon';
import {useAppTheme} from '../../../styles/Theme.ts';

interface BaseFABProps {
  icon?: IconSource;
  style?: StyleProp<ViewStyle>;
  color?: string;
  backgroundColor?: string;
  onPress: () => void;
}

export const BaseFAB = ({icon = 'plus', backgroundColor, color, onPress, style}: BaseFABProps) => {
  const theme = useAppTheme();

  const styles = StyleSheet.create({
    fab: {
      position: 'absolute',
      margin: 16,
      right: 0,
      bottom: 0,
      backgroundColor: backgroundColor ? backgroundColor : theme.colors.inverseSurface,
    },
  });

  return (
    <FAB
      icon={icon}
      style={[styles.fab, style]}
      onPress={onPress}
      color={color ? color : theme.colors.inverseOnSurface}
    />
  );
};
