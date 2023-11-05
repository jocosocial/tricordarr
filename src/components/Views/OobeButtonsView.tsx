import {useStyles} from '../Context/Contexts/StyleContext';
import React from 'react';
import {View} from 'react-native';
import {PrimaryActionButton} from '../Buttons/PrimaryActionButton';
import {useAppTheme} from '../../styles/Theme';

interface OobeButtonsViewProps {
  leftText?: string;
  leftOnPress?: () => void;
  leftMode?: 'contained' | 'text' | 'outlined' | 'elevated' | 'contained-tonal';
  leftDisabled?: boolean;
  rightText?: string;
  rightOnPress?: () => void;
  rightMode?: 'contained' | 'text' | 'outlined' | 'elevated' | 'contained-tonal';
  rightDisabled?: boolean;
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
}: OobeButtonsViewProps) => {
  const {commonStyles} = useStyles();
  const theme = useAppTheme();

  const styles = {
    buttonContainer: {
      ...commonStyles.flexRow,
      ...commonStyles.justifySpaceBetween,
      ...commonStyles.paddingHorizontal,
      ...commonStyles.paddingVertical,
      alignItems: 'center',
    },
    leftButtonContainer: {
      flex: 0,
    },
    leftButton: {
      ...commonStyles.flexStart,
    },
    rightButtonContainer: {
      flex: 0,
    },
    rightButton: {
      ...commonStyles.flexEnd,
    },
  };

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
            textColor={theme.colors.onBackground}
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
          />
        )}
      </View>
    </View>
  );
};
