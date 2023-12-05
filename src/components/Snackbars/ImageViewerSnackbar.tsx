import React from 'react';
import {SnackBarBase, SnackBarBaseProps} from './SnackBarBase';
import {StyleSheet} from 'react-native';

export const ImageViewerSnackbar = ({
  setMessage,
  message,
  duration = 4000,
  messagePrefix = '✅ ',
}: SnackBarBaseProps) => {
  const styles = StyleSheet.create({
    snackbar: {
      marginBottom: 80,
    },
  });
  return (
    <SnackBarBase
      style={styles.snackbar}
      message={message}
      setMessage={setMessage}
      messagePrefix={messagePrefix}
      duration={duration}
      elevation={0}
    />
  );
};
