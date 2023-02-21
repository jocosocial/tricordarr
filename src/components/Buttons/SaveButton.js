import {Button, useTheme} from 'react-native-paper';
import React from 'react';
import {buttonStyles} from '../../styles/Buttons';

export const SaveButton = ({buttonText = 'Save', onPress, buttonColor = undefined}) => {
  const theme = useTheme();

  if (!buttonColor) {
    buttonColor = theme.colors.twitarrPositiveButton;
  }

  return (
    <Button buttonColor={buttonColor} style={buttonStyles.setting} mode="contained" onPress={() => onPress()}>
      {buttonText}
    </Button>
  );
};
