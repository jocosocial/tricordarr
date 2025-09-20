import React from 'react';
import {StyleProp, StyleSheet, ViewStyle} from 'react-native';
import {FAB} from 'react-native-paper';
import {IconSource} from 'react-native-paper/lib/typescript/components/Icon';
import {useAppTheme} from '#src/Styles/Theme';
import {usePrivilege} from '#src/Context/Contexts/PrivilegeContext';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {useSnackbar} from '#src/Context/Contexts/SnackbarContext';

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
  const {commonStyles, styleDefaults} = useStyles();
  const {snackbarPayload} = useSnackbar();

  const colorInternal = color
    ? color
    : asPrivilegedUser
      ? theme.colors.onErrorContainer
      : theme.colors.inverseOnSurface;

  const styles = StyleSheet.create({
    fab: {
      ...commonStyles.fabBase,
      backgroundColor: backgroundColor
        ? backgroundColor
        : asPrivilegedUser
          ? theme.colors.errorContainer
          : theme.colors.inverseSurface,
      bottom: snackbarPayload ? styleDefaults.overScrollHeight * 0.75 : 0,
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
