import React from 'react';
import {IconButton} from 'react-native-paper';
import {useAppTheme} from '#src/Styles/Theme';
import {useStyles} from '#src/Components/Context/Contexts/StyleContext';
import {ActivityIndicator} from 'react-native-paper';
import {AppIcons} from '#src/Libraries/Enums/Icons';
import {usePrivilege} from '#src/Components/Context/Contexts/PrivilegeContext';
import {IconSource} from 'react-native-paper/lib/typescript/components/Icon';

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
  const theme = useAppTheme();
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
