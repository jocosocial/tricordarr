import React from 'react';
import {SnackBarBase, SnackBarBaseProps} from '#src/Components/Snackbars/SnackBarBase';
import {StyleSheet} from 'react-native';
import {useStyles} from '#src/Context/Contexts/StyleContext';

export const ImageViewerSnackbar = ({
  setMessage,
  message,
  duration = 4000,
  messagePrefix = '✅ ',
}: SnackBarBaseProps) => {
  const {styleDefaults} = useStyles();
  const styles = StyleSheet.create({
    snackbar: {
      marginBottom: styleDefaults.marginSize * 5,
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
