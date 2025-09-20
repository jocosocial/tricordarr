import React from 'react';
import {StyleSheet} from 'react-native';
import {useSnackbar} from '../Context/Contexts/SnackbarContext.ts';
import {Snackbar, Text} from 'react-native-paper';
import {useAppTheme} from '../../Styles/Theme.ts';
// import {useStyles} from '../Context/Contexts/StyleContext.ts';

export const AppSnackbar = () => {
  const {snackbarPayload, setSnackbarPayload} = useSnackbar();
  const theme = useAppTheme();
  // const {styleDefaults} = useStyles();

  const styles = StyleSheet.create({
    snackbar: {
      // For some reason this is undefined.
      // marginBottom: styleDefaults.overScrollHeight,
      marginBottom: 100,
    },
    // Snackbar uses .onSurface color, so we need to invert
    // any custom text.
    // https://callstack.github.io/react-native-paper/docs/components/Snackbar/
    text: {
      color: theme.colors.surface,
    },
  });

  if (!snackbarPayload) {
    return null;
  }

  return (
    <Snackbar
      style={[styles.snackbar, snackbarPayload.style]}
      duration={snackbarPayload.duration || 5000}
      visible={!!snackbarPayload}
      action={snackbarPayload.action || {label: 'Close'}}
      elevation={snackbarPayload.elevation}
      onDismiss={() => setSnackbarPayload(undefined)}>
      <Text style={styles.text}>
        {snackbarPayload.messageType === 'info' && 'ℹ️ '}
        {snackbarPayload.messageType === 'error' && '🚨️ '}
        {snackbarPayload.messageType === 'success' && '✅️ '}
        {snackbarPayload.message}
      </Text>
    </Snackbar>
  );
};
