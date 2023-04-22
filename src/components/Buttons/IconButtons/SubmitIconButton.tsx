import React from 'react';
import {IconButton} from 'react-native-paper';
import {useAppTheme} from '../../../styles/Theme';
import {useStyles} from '../../Context/Contexts/StyleContext';
import {ActivityIndicator} from 'react-native-paper';
import {AppIcons} from '../../../libraries/Enums/Icons';

interface SubmitIconButtonProps {
  onPress: () => void;
  icon?: string;
  containerColor?: string;
  disabled?: boolean;
  submitting?: boolean;
}

export const SubmitIconButton = ({
  onPress,
  icon = AppIcons.submit,
  containerColor,
  disabled = false,
  submitting = false,
}: SubmitIconButtonProps) => {
  const theme = useAppTheme();
  const {styleDefaults} = useStyles();

  const iconProp = submitting ? () => <ActivityIndicator /> : icon;

  return (
    <IconButton
      iconColor={theme.colors.onBackground}
      containerColor={containerColor}
      onPress={onPress}
      size={styleDefaults.iconSize}
      icon={iconProp}
      disabled={disabled || submitting}
    />
  );
};
