import React, {useState} from 'react';
import {Menu} from 'react-native-paper';
import {AppIcons} from '../../libraries/Enums/Icons';
import {Item} from 'react-navigation-header-buttons';
import {useScheduleStack} from '../Navigation/Stacks/ScheduleStackNavigator';
import {ScheduleStackComponents} from '../../libraries/Enums/Navigation';

export const ScheduleMenu = () => {
  const [visible, setVisible] = useState(false);
  const navigation = useScheduleStack();

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
    </Menu>
  );
};
