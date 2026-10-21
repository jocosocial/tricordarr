import React from 'react';
import {StyleSheet, View} from 'react-native';
import {IconSource} from 'react-native-paper/lib/typescript/components/Icon';

import {PrimaryActionButton} from '#src/Components/Buttons/PrimaryActionButton';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {useAppTheme} from '#src/Context/Contexts/ThemeContext';

const oobeButtonTestID = (label: string) => `oobe${label.replace(/[^a-zA-Z0-9]/g, '')}-button`;

interface OobeButtonsViewProps {
  leftText?: string;
  leftOnPress?: () => void;
  leftMode?: 'contained' | 'text' | 'outlined' | 'elevated' | 'contained-tonal';
  leftDisabled?: boolean;
  rightText?: string;
  rightOnPress?: () => void;
  rightMode?: 'contained' | 'text' | 'outlined' | 'elevated' | 'contained-tonal';
  rightDisabled?: boolean;
  middleText?: string;
  middleOnPress?: () => void;
  middleMode?: 'contained' | 'text' | 'outlined' | 'elevated' | 'contained-tonal';
  middleDisabled?: boolean;
  middleIcon?: IconSource;
  leftButtonColor?: string;
  middleButtonColor?: string;
  rightButtonColor?: string;
  leftButtonTextColor?: string;
  middleButtonTextColor?: string;
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
  middleText,
  middleOnPress,
  middleMode = 'contained',
  middleDisabled = false,
  middleIcon,
  leftButtonColor,
  middleButtonColor,
  rightButtonColor,
  leftButtonTextColor,
  middleButtonTextColor,
  rightButtonTextColor,
}: OobeButtonsViewProps) => {
  const {commonStyles} = useStyles();
  const {theme} = useAppTheme();

  const styles = StyleSheet.create({
    buttonContainer: {
      ...commonStyles.flexRow,
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
    middleButtonContainer: {
      ...commonStyles.flex,
      ...commonStyles.alignItemsCenter,
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
            testID={oobeButtonTestID(leftText)}
          />
        )}
      </View>
      <View style={styles.middleButtonContainer}>
        {middleText && middleOnPress && (
          <PrimaryActionButton
            buttonText={middleText}
            onPress={middleOnPress}
            mode={middleMode}
            disabled={middleDisabled}
            icon={middleIcon}
            buttonColor={middleButtonColor}
            textColor={middleButtonTextColor}
            testID={oobeButtonTestID(middleText)}
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
            testID={oobeButtonTestID(rightText)}
          />
        )}
      </View>
    </View>
  );
};
