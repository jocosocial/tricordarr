import React from 'react';
import {StyleSheet} from 'react-native';
import {IconSource} from 'react-native-paper/lib/typescript/components/Icon';

import {PrimaryActionButton} from '#src/Components/Buttons/PrimaryActionButton';
import {bottomSheetItemWidth} from '#src/Components/Sheets/AppBottomSheet';
import {useAppTheme} from '#src/Context/Contexts/ThemeContext';

const styles = StyleSheet.create({
  button: {
    width: bottomSheetItemWidth,
  },
});

interface AppBottomSheetButtonProps {
  buttonText: string;
  onPress: () => void;
  /** Omit for a text-only button. */
  icon?: IconSource;
  testID: string;
  disabled?: boolean;
  isLoading?: boolean;
  /** Overrides the default neutral (blue) background. */
  buttonColor?: string;
  /** Overrides the text and icon color; pair with `buttonColor`. */
  textColor?: string;
}

/**
 * Action button for an AppBottomSheet, sized and colored to match the other rows.
 */
export const AppBottomSheetButton = ({
  buttonText,
  onPress,
  icon,
  testID,
  disabled,
  isLoading,
  buttonColor,
  textColor,
}: AppBottomSheetButtonProps) => {
  const {theme} = useAppTheme();

  return (
    <PrimaryActionButton
      buttonText={buttonText}
      onPress={onPress}
      buttonColor={buttonColor ?? theme.colors.twitarrNeutralButton}
      textColor={textColor}
      icon={icon}
      testID={testID}
      viewStyle={styles.button}
      disabled={disabled}
      isLoading={isLoading}
    />
  );
};
