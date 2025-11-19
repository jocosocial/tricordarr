import React from 'react';
import {StyleSheet, View} from 'react-native';

import {PrimaryActionButton} from '#src/Components/Buttons/PrimaryActionButton';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {useAppTheme} from '#src/Context/Contexts/ThemeContext';

interface OobeButtonsViewProps {
  leftText?: string;
  leftOnPress?: () => void;
  leftMode?: 'contained' | 'text' | 'outlined' | 'elevated' | 'contained-tonal';
  leftDisabled?: boolean;
  rightText?: string;
  rightOnPress?: () => void;
  rightMode?: 'contained' | 'text' | 'outlined' | 'elevated' | 'contained-tonal';
  rightDisabled?: boolean;
  leftButtonColor?: string;
  rightButtonColor?: string;
  leftButtonTextColor?: string;
  rightButtonTextColor?: string;
}

export const OobeButtonsView = ({
  leftText = 'Previous',
  leftOnPress,
  rightText = 'Next',
  rightOnPress,
  leftMode = 'outlined',
  rightMode = 'contained',
  leftDisabled = false,
  rightDisabled = false,
  leftButtonColor,
  rightButtonColor,
  leftButtonTextColor,
  rightButtonTextColor,
}: OobeButtonsViewProps) => {
  const {commonStyles} = useStyles();
  const {theme} = useAppTheme();

  const styles = StyleSheet.create({
    buttonContainer: {
      ...commonStyles.flexRow,
      ...commonStyles.justifySpaceBetween,
      ...commonStyles.paddingHorizontal,
      ...commonStyles.paddingVertical,
      ...commonStyles.alignItemsCenter,
    },
    leftButtonContainer: {
      ...commonStyles.flex0,
    },
    leftButton: {
      ...commonStyles.flexStart,
    },
    rightButtonContainer: {
      ...commonStyles.flex0,
    },
    rightButton: {
      ...commonStyles.flexEnd,
    },
  });

  return (
    <View style={styles.buttonContainer}>
      <View style={styles.leftButtonContainer}>
        {leftText && leftOnPress && (
          <PrimaryActionButton
            buttonText={leftText}
            onPress={leftOnPress}
            style={styles.leftButton}
            mode={leftMode}
            disabled={leftDisabled}
            textColor={leftButtonTextColor || theme.colors.onBackground}
            buttonColor={leftButtonColor}
          />
        )}
      </View>
      <View style={styles.rightButtonContainer}>
        {rightText && rightOnPress && (
          <PrimaryActionButton
            buttonText={rightText}
            onPress={rightOnPress}
            style={styles.rightButton}
            mode={rightMode}
            disabled={rightDisabled}
            buttonColor={rightButtonColor}
            textColor={rightButtonTextColor || theme.colors.onTwitarrPositiveButton}
          />
        )}
      </View>
    </View>
  );
};
