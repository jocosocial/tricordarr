import {Button, useTheme} from 'react-native-paper';
import React from 'react';
import {StyleSheet} from 'react-native';

const style = StyleSheet.create({
  button: {
    margin: 20,
  },
});

export const SaveButton = ({buttonText = 'Save', onPress, buttonColor = undefined}) => {
  const theme = useTheme();

  if (!buttonColor) {
    buttonColor = theme.colors.twitarrPositiveButton;
  }

  return (
    <Button buttonColor={buttonColor} style={style.button} mode="contained" onPress={() => onPress()}>
      {buttonText}
    </Button>
  );
};
