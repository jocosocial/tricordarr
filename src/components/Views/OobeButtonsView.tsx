import {useStyles} from '../Context/Contexts/StyleContext';
import React from 'react';
import {View} from 'react-native';
import {PrimaryActionButton} from '../Buttons/PrimaryActionButton';

interface OobeButtonsViewProps {
  leftText?: string;
  leftOnPress?: () => void;
  leftMode?: 'contained' | 'text' | 'outlined' | 'elevated' | 'contained-tonal';
  rightText?: string;
  rightOnPress?: () => void;
  rightMode?: 'contained' | 'text' | 'outlined' | 'elevated' | 'contained-tonal';
}

export const OobeButtonsView = ({
  leftText,
  leftOnPress,
  rightText,
  rightOnPress,
  leftMode = 'outlined',
  rightMode = 'contained',
}: OobeButtonsViewProps) => {
  const {commonStyles} = useStyles();

  const styles = {
    buttonContainer: {
      ...commonStyles.flexRow,
      ...commonStyles.justifySpaceBetween,
      // justifyContent: 'flex-end',
      ...commonStyles.paddingSides,
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
          <PrimaryActionButton buttonText={leftText} onPress={leftOnPress} style={styles.leftButton} mode={leftMode} />
        )}
      </View>
      <View style={styles.rightButtonContainer}>
        {rightText && rightOnPress && (
          <PrimaryActionButton
            buttonText={rightText}
            onPress={rightOnPress}
            style={styles.rightButton}
            mode={rightMode}
          />
        )}
      </View>
    </View>
  );
};
