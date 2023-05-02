import React, {PropsWithChildren, ReactNode} from 'react';
import {Menu} from 'react-native-paper';

interface FezPostActionsMenuProps {
  visible: boolean;
  closeMenu: () => void;
  anchor: ReactNode;
}

export const FezPostActionsMenu = ({
  visible,
  closeMenu,
  anchor,
  children,
}: PropsWithChildren<FezPostActionsMenuProps>) => {
  return (
    <Menu visible={visible} onDismiss={closeMenu} anchor={anchor}>
      {children}
    </Menu>
  );
};
