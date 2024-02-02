import {AppIcons} from '../../../libraries/Enums/Icons';
import {HelpModalView} from '../../Views/Modals/HelpModalView';
import {Menu} from 'react-native-paper';
import React from 'react';
import {useModal} from '../../Context/Contexts/ModalContext';
import {IconSource} from 'react-native-paper/lib/typescript/components/Icon';

interface HelpMenuItemProps {
  closeMenu: () => void;
  helpContent: string[];
  title?: string;
  icon?: IconSource;
}
export const HelpMenuItem = ({icon = AppIcons.help, title = 'Help', closeMenu, helpContent}: HelpMenuItemProps) => {
  const {setModalContent, setModalVisible} = useModal();
  return (
    <Menu.Item
      leadingIcon={icon}
      title={title}
      onPress={() => {
        closeMenu();
        setModalContent(<HelpModalView title={title} text={helpContent} />);
        setModalVisible(true);
      }}
    />
  );
};
