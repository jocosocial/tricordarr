import React, {useState} from 'react';
import {Menu} from 'react-native-paper';
import {AppIcons} from '../../libraries/Enums/Icons';
import {Item} from 'react-navigation-header-buttons';
import {useScheduleStack} from '../Navigation/Stacks/ScheduleStackNavigator';
import {ScheduleStackComponents} from '../../libraries/Enums/Navigation';
import {HelpModalView} from '../Views/Modals/HelpModalView';
import {useModal} from '../Context/Contexts/ModalContext';

const helpContent = [
  'Official events (blue) are produced by the JoCo Cruise management or featured guests.',
  'Shadow events (purple) have been approved by the JoCo Cruise management but are run by attendees.',
  'Looking For Group events (grey) are organized by the attendee community.',
];

export const ScheduleMenu = () => {
  const [visible, setVisible] = useState(false);
  const navigation = useScheduleStack();
  const {setModalContent, setModalVisible} = useModal();

  const openMenu = () => setVisible(true);
  const closeMenu = () => setVisible(false);

  const menuAnchor = <Item title={'Schedule Options'} iconName={AppIcons.menu} onPress={openMenu} />;

  const handleNavigation = (screen: ScheduleStackComponents) => {
    navigation.push(screen);
    closeMenu();
  };

  return (
    <Menu visible={visible} onDismiss={closeMenu} anchor={menuAnchor}>
      <Menu.Item
        leadingIcon={AppIcons.search}
        title={'Search'}
        onPress={() => handleNavigation(ScheduleStackComponents.scheduleEventSearchScreen)}
      />
      <Menu.Item
        leadingIcon={AppIcons.settings}
        title={'Settings'}
        onPress={() => handleNavigation(ScheduleStackComponents.scheduleSettingsScreen)}
      />
      <Menu.Item
        leadingIcon={AppIcons.help}
        title={'Help'}
        onPress={() => {
          closeMenu();
          setModalContent(<HelpModalView text={helpContent} />);
          setModalVisible(true);
        }}
      />
    </Menu>
  );
};
