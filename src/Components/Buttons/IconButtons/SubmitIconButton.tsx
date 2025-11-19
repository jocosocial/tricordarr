import React from 'react';
import {ActivityIndicator, IconButton} from 'react-native-paper';
import {IconSource} from 'react-native-paper/lib/typescript/components/Icon';

import {usePrivilege} from '#src/Context/Contexts/PrivilegeContext';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {useAppTheme} from '#src/Context/Contexts/ThemeContext';
import {AppIcons} from '#src/Enums/Icons';

interface SubmitIconButtonProps {
  onPress: () => void;
  icon?: IconSource;
  disabled?: boolean;
  submitting?: boolean;
  iconColor?: string;
  containerColor?: string;
  withPrivilegeColors?: boolean;
}

export const SubmitIconButton = ({
  onPress,
  icon = AppIcons.submit,
  disabled = false,
  submitting = false,
  iconColor,
  containerColor,
  withPrivilegeColors,
}: SubmitIconButtonProps) => {
  const {theme} = useAppTheme();
  const {styleDefaults} = useStyles();
  const {asPrivilegedUser} = usePrivilege();
  const buttonContainerColor = asPrivilegedUser ? theme.colors.errorContainer : theme.colors.twitarrNeutralButton;
  const buttonColor = asPrivilegedUser ? theme.colors.onErrorContainer : theme.colors.onTwitarrNeutralButton;

  const iconProp = submitting ? () => <ActivityIndicator /> : icon;

  return (
    <IconButton
      iconColor={iconColor ? iconColor : withPrivilegeColors ? buttonColor : undefined}
      containerColor={containerColor ? containerColor : withPrivilegeColors ? buttonContainerColor : undefined}
      onPress={onPress}
      size={styleDefaults.iconSize}
      icon={iconProp}
      disabled={disabled || submitting}
    />
  );
};
