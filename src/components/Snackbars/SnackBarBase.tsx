import {Snackbar, Text} from 'react-native-paper';
import React from 'react';
import {useAppTheme} from '#src/Styles/Theme';
import {Animated, StyleProp, StyleSheet, ViewStyle} from 'react-native';
import {StringOrError} from '#src/Types';

export interface SnackBarBaseProps {
  message: string | undefined;
  setMessage: (e: StringOrError) => void;
  actionLabel?: string;
  duration?: number;
  messagePrefix?: string;
  style?: StyleProp<ViewStyle>;
  elevation?: 0 | 1 | 2 | 3 | 4 | 5 | Animated.Value;
}

export const SnackBarBase = ({
  setMessage,
  style,
  message = '',
  actionLabel = 'Close',
  duration = 5000,
  messagePrefix = '',
  elevation,
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
      elevation={elevation}
      onDismiss={() => setMessage(undefined)}>
      <Text style={styles.text}>
        {messagePrefix}
        {message}
      </Text>
    </Snackbar>
  );
};
