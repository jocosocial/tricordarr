import React from 'react';
import {useErrorHandler} from '../Context/Contexts/ErrorHandlerContext';
import {SnackBarBase} from './SnackBarBase';
import {StyleSheet} from 'react-native';

// Lifted right from the source.
// https://callstack.github.io/react-native-paper/docs/components/Snackbar
export const InfoSnackbar = () => {
  const {infoMessage, setInfoMessage} = useErrorHandler();

  const styles = StyleSheet.create({
    snackbar: {
      marginBottom: 100,
    },
  });

  return (
    <SnackBarBase
      duration={3000}
      message={infoMessage}
      setMessage={setInfoMessage}
      messagePrefix={'ℹ️ '}
      style={styles.snackbar}
    />
  );
};
