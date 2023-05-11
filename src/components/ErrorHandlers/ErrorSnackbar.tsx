import React from 'react';
import {Snackbar, Text, useTheme} from 'react-native-paper';
import {useErrorHandler} from '../Context/Contexts/ErrorHandlerContext';

interface ErrorSnackbarProps {
  actionLabel: string;
}

// Lifted right from the source.
// https://callstack.github.io/react-native-paper/docs/components/Snackbar
export const ErrorSnackbar = ({actionLabel = 'Close'}: ErrorSnackbarProps) => {
  const {errorMessage, setErrorMessage} = useErrorHandler();
  const onDismissSnackBar = () => setErrorMessage('');
  const theme = useTheme();

  // Snackbar uses .onSurface color, so we need to invert
  // any custom text.
  // https://callstack.github.io/react-native-paper/docs/components/Snackbar/
  const textStyle = {
    color: theme.colors.surface,
  };

  return (
    <Snackbar
      visible={!!errorMessage}
      onDismiss={onDismissSnackBar}
      action={{
        label: actionLabel,
      }}>
      <Text style={textStyle}>🚨 {errorMessage}</Text>
    </Snackbar>
  );
};
