import {Snackbar, Text} from 'react-native-paper';
import React, {Dispatch, SetStateAction} from 'react';
import {useAppTheme} from '../../styles/Theme';
import {StyleProp, StyleSheet, ViewStyle} from 'react-native';

export interface SnackBarBaseProps {
  message: string | undefined;
  setMessage: Dispatch<SetStateAction<string | undefined>>;
  actionLabel?: string;
  duration?: number;
  messagePrefix?: string;
  style?: StyleProp<ViewStyle>;
}

export const SnackBarBase = ({
  setMessage,
  style,
  message = '',
  actionLabel = 'Close',
  duration = 5000,
  messagePrefix = '',
}: SnackBarBaseProps) => {
  const theme = useAppTheme();

  // Snackbar uses .onSurface color, so we need to invert
  // any custom text.
  // https://callstack.github.io/react-native-paper/docs/components/Snackbar/
  const styles = StyleSheet.create({
    text: {
      color: theme.colors.surface,
    },
  });

  return (
    <Snackbar
      style={style}
      duration={duration}
      visible={!!message}
      action={{label: actionLabel}}
      onDismiss={() => setMessage(undefined)}>
      <Text style={styles.text}>
        {messagePrefix}
        {message}
      </Text>
    </Snackbar>
  );
};
