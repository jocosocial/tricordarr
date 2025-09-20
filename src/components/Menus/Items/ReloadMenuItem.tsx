import React from 'react';
import {Menu} from 'react-native-paper';

import {AppIcons} from '#src/Enums/Icons';

interface ReloadMenuItemProps {
  closeMenu?: () => void;
  onReload: () => void;
}

export const ReloadMenuItem = (props: ReloadMenuItemProps) => {
  return (
    <Menu.Item
      title={'Reload'}
      leadingIcon={AppIcons.reload}
      onPress={() => {
        if (props.closeMenu) {
          props.closeMenu();
        }
        props.onReload();
      }}
    />
  );
};
