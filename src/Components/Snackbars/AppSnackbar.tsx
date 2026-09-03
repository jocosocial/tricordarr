import React, {useMemo} from 'react';
import {StyleSheet} from 'react-native';
import {Snackbar, Text} from 'react-native-paper';

import {useSnackbar} from '#src/Context/Contexts/SnackbarContext';
import {useAppTheme} from '#src/Context/Contexts/ThemeContext';

interface AppSnackbarProps {
  /**
   * Skip the tab-bar offset. Use when the snackbar is already in an overlay
   * (bottom sheet portal) that covers the tab bar.
   */
  overlay?: boolean;
  /**
   * Distance from the bottom of the overlay to the snackbar. Paper pins its
   * wrapper to the bottom of the parent; pass a measured height (sheet, footer)
   * so the toast sits above that UI instead of covering it.
   */
  bottomOffset?: number;
}

export const AppSnackbar = ({overlay = false, bottomOffset = 0}: AppSnackbarProps) => {
  const {snackbarPayload, setSnackbarPayload} = useSnackbar();
  const {theme} = useAppTheme();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        snackbar: {
          // For some reason styleDefaults.overScrollHeight is undefined.
          marginBottom: overlay ? 0 : 100,
        },
        // Snackbar uses .onSurface color, so we need to invert
        // any custom text.
        // https://callstack.github.io/react-native-paper/docs/components/Snackbar/
        text: {
          color: theme.colors.surface,
        },
        wrapper: {
          bottom: bottomOffset,
          paddingBottom: 0,
          zIndex: 1,
        },
      }),
    [bottomOffset, overlay, theme.colors.surface],
  );

  if (!snackbarPayload) {
    return null;
  }

  return (
    <Snackbar
      style={[styles.snackbar, snackbarPayload.style]}
      wrapperStyle={overlay ? styles.wrapper : undefined}
      duration={snackbarPayload.duration || 5000}
      visible={!!snackbarPayload}
      action={snackbarPayload.action || {label: 'Close'}}
      elevation={snackbarPayload.elevation}
      onDismiss={() => setSnackbarPayload(undefined)}>
      <Text style={styles.text}>
        {snackbarPayload.messageType === 'info' && 'ℹ️ '}
        {snackbarPayload.messageType === 'error' && '🚨️ '}
        {snackbarPayload.messageType === 'success' && '✅️ '}
        {snackbarPayload.messageType === 'secret' && '🕵️ '}
        {snackbarPayload.message}
      </Text>
    </Snackbar>
  );
};
