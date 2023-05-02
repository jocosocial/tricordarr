import React, {ReactNode} from 'react';
import {Menu} from 'react-native-paper';
import {AppIcons} from '../../libraries/Enums/Icons';
import Clipboard from '@react-native-clipboard/clipboard';
import {FezPostData} from '../../libraries/Structs/ControllerStructs';

interface FezPostActionsMenuProps {
  visible: boolean;
  closeMenu: () => void;
  anchor: ReactNode;
  fezPost: FezPostData;
}

export const FezPostActionsMenu = ({visible, closeMenu, anchor, fezPost}: FezPostActionsMenuProps) => {
  return (
    <Menu visible={visible} onDismiss={closeMenu} anchor={anchor}>
      <Menu.Item
        dense={true}
        leadingIcon={AppIcons.copy}
        title={'Copy'}
        onPress={() => {
          Clipboard.setString(fezPost.text);
          closeMenu();
        }}
      />
    </Menu>
  );
};
