import React from 'react';
import {IconButton} from 'react-native-paper';
import {useAppTheme} from '../../../styles/Theme';
import {useStyles} from '../../Context/Contexts/StyleContext';
import {ActivityIndicator} from 'react-native-paper';

interface SubmitIconButtonProps {
  onPress: () => void;
  icon?: string;
  colorize?: boolean;
  disabled?: boolean;
  submitting?: boolean;
}

export const SubmitIconButton = ({
  onPress,
  icon = 'send-circle-outline',
  colorize = true,
  disabled = false,
  submitting = false,
}: SubmitIconButtonProps) => {
  const theme = useAppTheme();
  const {styleDefaults} = useStyles();

  const iconProp = submitting ? () => <ActivityIndicator /> : icon;

  return (
    <IconButton
      iconColor={theme.colors.onBackground}
      containerColor={colorize ? theme.colors.twitarrNeutralButton : theme.colors.background}
      onPress={onPress}
      size={styleDefaults.iconSize}
      icon={iconProp}
      disabled={disabled || submitting}
    />
  );
};
