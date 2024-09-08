import * as React from 'react';
import {useState} from 'react';
import {FAB} from 'react-native-paper';
import {useAppTheme} from '../../../styles/Theme';
import {AppIcons} from '../../../libraries/Enums/Icons';
import {IconSource} from 'react-native-paper/lib/typescript/components/Icon';
import {StyleSheet} from 'react-native';
import {FabGroupActionType} from '../../../libraries/Types';

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
  const {open} = state;

  const onStateChange = ({open}: {open: boolean}) => setState({open});

  const styles = StyleSheet.create({
    fabGroup: {
      backgroundColor: backgroundColor ? backgroundColor : theme.colors.inverseSurface,
    },
  });

  return (
    <FAB.Group
      open={open}
      visible={true}
      icon={icon ? icon : AppIcons.menu}
      color={color ? color : theme.colors.inverseOnSurface}
      fabStyle={styles.fabGroup}
      label={openLabel ? (open || showLabel ? openLabel : undefined) : undefined}
      actions={actions}
      onStateChange={onStateChange}
    />
  );
};
