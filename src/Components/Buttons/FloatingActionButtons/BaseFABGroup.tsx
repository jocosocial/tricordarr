import {useBackHandler} from '@react-native-community/hooks';
import * as React from 'react';
import {useCallback, useState} from 'react';
import {StyleSheet} from 'react-native';
import {FAB} from 'react-native-paper';
import {IconSource} from 'react-native-paper/lib/typescript/components/Icon';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {useSnackbar} from '#src/Context/Contexts/SnackbarContext';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {useAppTheme} from '#src/Context/Contexts/ThemeContext';
import {AppIcons} from '#src/Enums/Icons';
import {FabGroupActionType} from '#src/Types';

interface BaseFABProps {
  actions: FabGroupActionType[];
  color?: string;
  backgroundColor?: string;
  openLabel?: string;
  icon?: IconSource;
  showLabel?: boolean;
  testID: string;
}

export const BaseFABGroup = ({
  color,
  backgroundColor,
  openLabel,
  icon,
  actions = [],
  showLabel = true,
  testID,
}: BaseFABProps) => {
  const [state, setState] = useState({open: false});
  const {theme} = useAppTheme();
  const {styleDefaults} = useStyles();
  const insets = useSafeAreaInsets();
  const {snackbarPayload} = useSnackbar();

  const onStateChange = ({open}: {open: boolean}) => setState({open});

  /**
   * Close an open speed dial on Android Back. Paper's FAB.Group does not
   * register a BackHandler of its own.
   */
  const handleFabGroupBackPress = useCallback(() => {
    if (state.open) {
      setState({open: false});
      return true;
    }
    return false;
  }, [state.open]);

  useBackHandler(handleFabGroupBackPress);

  const styles = StyleSheet.create({
    button: {
      backgroundColor: backgroundColor ? backgroundColor : theme.colors.inverseSurface,
    },
    group: {
      // This is all fucking stupid.
      // Paper's FAB.Group adds the bottom safe-area inset internally. When a tab
      // bar already consumed that inset, this negative margin cancels Paper's
      // extra offset so the FAB sits above the tab bar.
      marginBottom: -1 * insets.bottom,
      bottom: snackbarPayload ? styleDefaults.overScrollHeight * 0.75 : 0,
    },
  });

  return (
    <FAB.Group
      testID={testID}
      open={state.open}
      visible={true}
      icon={icon ? icon : AppIcons.menu}
      color={color ? color : theme.colors.inverseOnSurface}
      fabStyle={styles.button}
      style={styles.group}
      label={openLabel ? (state.open || showLabel ? openLabel : undefined) : undefined}
      actions={actions}
      onStateChange={onStateChange}
    />
  );
};
