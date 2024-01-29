import {AppIcons} from '../../../libraries/Enums/Icons';
import {HelpModalView} from '../../Views/Modals/HelpModalView';
import {Menu} from 'react-native-paper';
import React from 'react';
import {useModal} from '../../Context/Contexts/ModalContext';

interface HelpMenuItemProps {
  closeMenu: () => void;
  helpContent: string[];
}
export const HelpMenuItem = (props: HelpMenuItemProps) => {
  const {setModalContent, setModalVisible} = useModal();
  return (
    <Menu.Item
      leadingIcon={AppIcons.help}
      title={'Help'}
      onPress={() => {
        props.closeMenu();
        setModalContent(<HelpModalView text={props.helpContent} />);
        setModalVisible(true);
      }}
    />
  );
};
