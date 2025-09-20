import {AppIcons} from '../../../Libraries/Enums/Icons';
import {Menu} from 'react-native-paper';
import React from 'react';

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
