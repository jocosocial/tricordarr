import {ActivityIndicator, Button} from 'react-native-paper';
import React from 'react';
import {commonStyles} from '../../styles';
import {useAppTheme} from '../../styles/Theme';
import {ViewStyle} from 'react-native';
import {AndroidColor} from '@notifee/react-native';

interface SaveButtonProps {
  buttonText: string;
  onPress: () => void;
  buttonColor?: string;
  textColor?: string;
  disabled?: boolean;
  mode?: 'text' | 'outlined' | 'contained' | 'elevated' | 'contained-tonal';
  style?: ViewStyle;
  isLoading?: boolean;
}

export const SaveButton = ({
  buttonText = 'Save',
  onPress,
  buttonColor = undefined,
  textColor = undefined,
  disabled = false,
  mode = 'contained',
  style = {},
  isLoading = false,
}: SaveButtonProps) => {
  const theme = useAppTheme();

  const buttonStyle = {
    // @TODO retrofit this out.
    // ...commonStyles.marginTop,
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
