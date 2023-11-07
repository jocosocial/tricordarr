import React, {useState} from 'react';
import {Menu} from 'react-native-paper';
import {AppIcons} from '../../libraries/Enums/Icons';
import {Item} from 'react-navigation-header-buttons';
import {useModal} from '../Context/Contexts/ModalContext';
import {HelpModalView} from '../Views/Modals/HelpModalView';

const helpContent = [
  'Always check the official daily printed schedule to confirm event times/locations.',
  'Favoriting an event adds it to your schedule and gives you reminder notifications.',
  'All events are given a corresponding forum. You can use that to discuss the event by tapping the forum button in the Menu.',
];

export const ScheduleEventMenu = () => {
  const [visible, setVisible] = useState(false);
  const {setModalContent, setModalVisible} = useModal();

  const openMenu = () => setVisible(true);
  const closeMenu = () => setVisible(false);

  const menuAnchor = <Item title={'Menu'} iconName={AppIcons.menu} onPress={openMenu} />;

  return (
    <Menu visible={visible} onDismiss={closeMenu} anchor={menuAnchor}>
      <Menu.Item title={'Download'} leadingIcon={AppIcons.download} onPress={() => console.log('download')} />
      <Menu.Item
        title={'Help'}
        leadingIcon={AppIcons.help}
        onPress={() => {
          closeMenu();
          setModalContent(<HelpModalView text={helpContent} />);
          setModalVisible(true);
        }}
      />
    </Menu>
  );
};
