import React from 'react';
import {useErrorHandler} from '../Context/Contexts/ErrorHandlerContext';
import {SnackBarBase} from './SnackBarBase';
import {StyleSheet} from 'react-native';

// Lifted right from the source.
// https://callstack.github.io/react-native-paper/docs/components/Snackbar
export const ErrorSnackbar = () => {
  const {errorMessage, setErrorMessage} = useErrorHandler();

  const styles = StyleSheet.create({
    snackbar: {
      marginBottom: 100,
    },
  });

  return (
    <SnackBarBase message={errorMessage} setMessage={setErrorMessage} messagePrefix={'🚨 '} style={styles.snackbar} />
  );
};
