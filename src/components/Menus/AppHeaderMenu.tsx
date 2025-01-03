import React, {PropsWithChildren, ReactNode} from 'react';
import {Menu} from 'react-native-paper';
import {useStyles} from '../Context/Contexts/StyleContext.ts';

interface HeaderMenuProps extends PropsWithChildren {
  visible: boolean;
  anchor: ReactNode;
  onDismiss?: () => void;
}

export const AppHeaderMenu = ({visible, anchor, onDismiss, children}: HeaderMenuProps) => {
  const {commonStyles} = useStyles();
  return (
    <Menu visible={visible} onDismiss={onDismiss} anchor={anchor} style={commonStyles.safeMarginTop}>
      {children}
    </Menu>
  );
};
