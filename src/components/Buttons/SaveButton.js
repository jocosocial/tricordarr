import {Button, useTheme} from 'react-native-paper';
import React from 'react';
import {commonStyles} from '../../styles';

export const SaveButton = ({buttonText = 'Save', onPress, buttonColor = undefined}) => {
  const theme = useTheme();

  if (!buttonColor) {
    buttonColor = theme.colors.twitarrPositiveButton;
  }

  const buttonStyle = {
    ...commonStyles.marginTop,
  };

  return (
    <Button buttonColor={buttonColor} style={buttonStyle} mode="contained" onPress={() => onPress()}>
      {buttonText}
    </Button>
  );
};
