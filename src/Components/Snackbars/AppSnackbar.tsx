import React, {useMemo} from 'react';
import {StyleSheet} from 'react-native';
import {Snackbar, Text} from 'react-native-paper';

import {useSnackbar} from '#src/Context/Contexts/SnackbarContext';
import {useAppTheme} from '#src/Context/Contexts/ThemeContext';

interface AppSnackbarProps {
  /**
   * Drop Paper's bottom safe-area padding. Use when something below the snackbar
   * already covers that inset: the tab bar on a tab screen, or a bottom sheet
   * overlay.
   */
  ignoreBottomInset?: boolean;
  /**
   * Distance from the bottom of the parent to the snackbar. Paper pins its
   * wrapper to the bottom of the parent; pass a measured height (sheet, footer)
   * so the toast sits above that UI instead of covering it.
   */
  bottomOffset?: number;
}

/**
 * The app-wide snackbar fed by `useSnackbar()`. Paper's Snackbar is absolutely
 * positioned at the bottom of whatever parent renders it, so this is placed
 * inline (no Portal): last in `AppView` it sits just above the tab bar, and in a
 * bottom sheet container it sits above the sheet. Rendering inline keeps the
 * navigation and screen contexts, which a Portal would drop.
 */
export const AppSnackbar = ({ignoreBottomInset = false, bottomOffset = 0}: AppSnackbarProps) => {
  const {snackbarPayload, setSnackbarPayload} = useSnackbar();
  const {theme} = useAppTheme();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        // Snackbar uses .onSurface color, so we need to invert
        // any custom text.
        // https://callstack.github.io/react-native-paper/docs/components/Snackbar/
        text: {
          color: theme.colors.surface,
        },
        // Paper merges wrapperStyle over its own paddings, so only name paddingBottom
        // when overriding it; an explicit undefined would clear Paper's inset padding.
        wrapper: {
          bottom: bottomOffset,
          ...(ignoreBottomInset ? {paddingBottom: 0} : undefined),
          zIndex: 1,
        },
      }),
    [bottomOffset, ignoreBottomInset, theme.colors.surface],
  );

  if (!snackbarPayload) {
    return null;
  }

  return (
    <Snackbar
      style={snackbarPayload.style}
      wrapperStyle={styles.wrapper}
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
