import {ActivityIndicator, Button} from 'react-native-paper';
import React from 'react';
import {useAppTheme} from '../../styles/Theme';
import {StyleProp, View, ViewStyle} from 'react-native';
import {AndroidColor} from '@notifee/react-native';

interface PrimaryActionButtonProps {
  buttonText: string;
  onPress: () => void;
  buttonColor?: string;
  textColor?: string;
  disabled?: boolean;
  mode?: 'text' | 'outlined' | 'contained' | 'elevated' | 'contained-tonal';
  style?: StyleProp<ViewStyle>;
  isLoading?: boolean;
  viewStyle?: StyleProp<ViewStyle>;
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
  viewStyle,
}: PrimaryActionButtonProps) => {
  const theme = useAppTheme();

  const buttonStyle = {
    borderWidth: 0,
  };

  const getLoadingIcon = () => <ActivityIndicator />;

  return (
    <View style={viewStyle}>
      <Button
        buttonColor={buttonColor || theme.colors.twitarrPositiveButton}
        textColor={textColor || AndroidColor.WHITE}
        style={[buttonStyle, style]}
        mode={mode}
        onPress={onPress}
        icon={isLoading ? getLoadingIcon : undefined}
        disabled={disabled}>
        {buttonText}
      </Button>
    </View>
  );
};
