import React from 'react';
import {IconButton} from 'react-native-paper';
import {useAppTheme} from '../../../styles/Theme';
import {useStyles} from '../../Context/Contexts/StyleContext';
import {ActivityIndicator} from 'react-native-paper';
import {AppIcons} from '../../../libraries/Enums/Icons';
import {usePrivilege} from '../../Context/Contexts/PrivilegeContext';

interface SubmitIconButtonProps {
  onPress: () => void;
  icon?: string;
  disabled?: boolean;
  submitting?: boolean;
}

export const SubmitIconButton = ({
  onPress,
  icon = AppIcons.submit,
  disabled = false,
  submitting = false,
}: SubmitIconButtonProps) => {
  const theme = useAppTheme();
  const {styleDefaults} = useStyles();
  const {asPrivilegedUser} = usePrivilege();
  const containerColor = asPrivilegedUser ? theme.colors.errorContainer : theme.colors.twitarrNeutralButton;
  const iconColor = asPrivilegedUser ? theme.colors.onErrorContainer : theme.colors.onBackground;

  const iconProp = submitting ? () => <ActivityIndicator /> : icon;

  return (
    <IconButton
      iconColor={iconColor}
      containerColor={containerColor}
      onPress={onPress}
      size={styleDefaults.iconSize}
      icon={iconProp}
      disabled={disabled || submitting}
    />
  );
};
