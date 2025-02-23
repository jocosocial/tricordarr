import {ActivityIndicator, Button} from 'react-native-paper';
import React from 'react';
import {useAppTheme} from '../../styles/Theme';
import {StyleProp, View, ViewStyle} from 'react-native';
import {AndroidColor} from '@notifee/react-native';
import {IconSource} from 'react-native-paper/lib/typescript/components/Icon';

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
  icon?: IconSource;
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
  icon,
}: PrimaryActionButtonProps) => {
  const theme = useAppTheme();

  const buttonStyle = {
    borderWidth: mode === 'contained' ? 0 : 1,
  };

  const getLoadingIcon = () => <ActivityIndicator />;

  return (
    <View style={viewStyle}>
      <Button
        buttonColor={mode === 'contained' ? buttonColor || theme.colors.twitarrPositiveButton : buttonColor}
        textColor={textColor || AndroidColor.WHITE}
        style={[buttonStyle, style]}
        mode={mode}
        onPress={onPress}
        icon={isLoading ? getLoadingIcon : icon}
        disabled={disabled}>
        {buttonText}
      </Button>
    </View>
  );
};
