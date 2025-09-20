import * as React from 'react';
import {useState} from 'react';
import {StyleSheet} from 'react-native';
import {FAB} from 'react-native-paper';
import {IconSource} from 'react-native-paper/lib/typescript/components/Icon';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {useSnackbar} from '#src/Context/Contexts/SnackbarContext';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {AppIcons} from '#src/Enums/Icons';
import {useAppTheme} from '#src/Styles/Theme';
import {FabGroupActionType} from '#src/Types';

interface BaseFABProps {
  actions: FabGroupActionType[];
  color?: string;
  backgroundColor?: string;
  openLabel?: string;
  icon?: IconSource;
  showLabel?: boolean;
}

export const BaseFABGroup = ({
  color,
  backgroundColor,
  openLabel,
  icon,
  actions = [],
  showLabel = true,
}: BaseFABProps) => {
  const [state, setState] = useState({open: false});
  const theme = useAppTheme();
  const {styleDefaults} = useStyles();
  const insets = useSafeAreaInsets();
  const {snackbarPayload} = useSnackbar();

  const onStateChange = ({open}: {open: boolean}) => setState({open});

  const styles = StyleSheet.create({
    button: {
      backgroundColor: backgroundColor ? backgroundColor : theme.colors.inverseSurface,
    },
    group: {
      // This is all fucking stupid.
      marginBottom: -1 * insets.bottom,
      bottom: snackbarPayload ? styleDefaults.overScrollHeight * 0.75 : 0,
    },
  });

  return (
    <FAB.Group
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
