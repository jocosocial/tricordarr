import React, {ReactNode} from 'react';
import {Menu} from 'react-native-paper';
import {AppIcons} from '../../../libraries/Enums/Icons.ts';
import Clipboard from '@react-native-clipboard/clipboard';
import {FezPostData} from '../../../libraries/Structs/ControllerStructs.tsx';
import {useModal} from '../../Context/Contexts/ModalContext.ts';
import {ReportModalView} from '../../Views/Modals/ReportModalView.tsx';
import {useTwitarr} from '../../Context/Contexts/TwitarrContext.ts';
import {FezType} from '../../../libraries/Enums/FezType.ts';

interface FezPostActionsMenuProps {
  visible: boolean;
  closeMenu: () => void;
  anchor: ReactNode;
  fezPost: FezPostData;
}

export const FezPostActionsMenu = ({visible, closeMenu, anchor, fezPost}: FezPostActionsMenuProps) => {
  const {setModalContent, setModalVisible} = useModal();
  const {fez} = useTwitarr();

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
