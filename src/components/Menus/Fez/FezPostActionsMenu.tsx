import React, {ReactNode} from 'react';
import {Menu} from 'react-native-paper';
import {AppIcons} from '../../../Libraries/Enums/Icons.ts';
import Clipboard from '@react-native-clipboard/clipboard';
import {FezData, FezPostData} from '../../../Libraries/Structs/ControllerStructs.tsx';
import {useModal} from '../../Context/Contexts/ModalContext.ts';
import {ReportModalView} from '../../Views/Modals/ReportModalView.tsx';
import {FezType} from '../../../Libraries/Enums/FezType.ts';

interface FezPostActionsMenuProps {
  visible: boolean;
  closeMenu: () => void;
  anchor: ReactNode;
  fezPost: FezPostData;
  fez: FezData;
}

export const FezPostActionsMenu = ({visible, closeMenu, anchor, fezPost, fez}: FezPostActionsMenuProps) => {
  const {setModalContent, setModalVisible} = useModal();

  const handleReport = () => {
    closeMenu();
    setModalContent(<ReportModalView fezPost={fezPost} />);
    setModalVisible(true);
  };

  return (
    <Menu visible={visible} onDismiss={closeMenu} anchor={anchor}>
      <Menu.Item
        dense={false}
        leadingIcon={AppIcons.copy}
        title={'Copy'}
        onPress={() => {
          Clipboard.setString(fezPost.text);
          closeMenu();
        }}
      />
      {fez && fez.fezType !== FezType.closed && (
        <Menu.Item dense={false} leadingIcon={AppIcons.report} title={'Report'} onPress={handleReport} />
      )}
    </Menu>
  );
};
