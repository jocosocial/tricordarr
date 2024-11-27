import React from 'react';
import {StyleProp, StyleSheet, ViewStyle} from 'react-native';
import {FAB} from 'react-native-paper';
import {IconSource} from 'react-native-paper/lib/typescript/components/Icon';
import {useAppTheme} from '../../../styles/Theme.ts';
import {usePrivilege} from '../../Context/Contexts/PrivilegeContext.ts';

interface BaseFABProps {
  icon?: IconSource;
  style?: StyleProp<ViewStyle>;
  color?: string;
  backgroundColor?: string;
  onPress: () => void;
  label?: string;
  showLabel?: boolean;
  asPrivilegedUser?: boolean;
}

export const BaseFAB = ({
  icon = 'plus',
  backgroundColor,
  color,
  onPress,
  style,
  label,
  showLabel = true,
}: BaseFABProps) => {
  const theme = useAppTheme();
  const {asPrivilegedUser} = usePrivilege();

  const colorInternal = color
    ? color
    : asPrivilegedUser
    ? theme.colors.onErrorContainer
    : theme.colors.inverseOnSurface;

  const styles = StyleSheet.create({
    fab: {
      position: 'absolute',
      margin: 16,
      right: 0,
      bottom: 0,
      backgroundColor: backgroundColor
        ? backgroundColor
        : asPrivilegedUser
        ? theme.colors.errorContainer
        : theme.colors.inverseSurface,
    },
  });

  return (
    <FAB
      icon={icon}
      style={[styles.fab, style]}
      onPress={onPress}
      color={colorInternal}
      label={label && showLabel ? label : undefined}
    />
  );
};
