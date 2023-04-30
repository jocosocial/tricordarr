import {ActivityIndicator, Button} from 'react-native-paper';
import React from 'react';
import {useAppTheme} from '../../styles/Theme';
import {ViewStyle} from 'react-native';
import {AndroidColor} from '@notifee/react-native';

interface PrimaryActionButtonProps {
  buttonText: string;
  onPress: () => void;
  buttonColor?: string;
  textColor?: string;
  disabled?: boolean;
  mode?: 'text' | 'outlined' | 'contained' | 'elevated' | 'contained-tonal';
  style?: ViewStyle;
  isLoading?: boolean;
}

/**
 * Stylized "main" button for general use.
 */
export const PrimaryActionButton = ({
  buttonText = 'Save',
  onPress,
  buttonColor = undefined,
  textColor = undefined,
  disabled = false,
  mode = 'contained',
  style = {},
  isLoading = false,
}: PrimaryActionButtonProps) => {
  const theme = useAppTheme();

  const buttonStyle = {
    borderWidth: 0,
    ...style,
  };

  const getLoadingIcon = () => <ActivityIndicator />;

  return (
    <Button
      buttonColor={buttonColor || theme.colors.twitarrPositiveButton}
      textColor={textColor || AndroidColor.WHITE}
      style={buttonStyle}
      mode={mode}
      onPress={onPress}
      icon={isLoading ? getLoadingIcon : undefined}
      disabled={disabled}>
      {buttonText}
    </Button>
  );
};
