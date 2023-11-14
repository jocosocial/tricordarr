import React, {useState} from 'react';
import {Menu} from 'react-native-paper';
import {AppIcons} from '../../libraries/Enums/Icons';
import {Item} from 'react-navigation-header-buttons';
import {useEventStackNavigation} from '../Navigation/Stacks/EventStackNavigator';
import {EventStackComponents} from '../../libraries/Enums/Navigation';

export const ScheduleLfgListMenu = () => {
  const [visible, setVisible] = useState(false);
  const navigation = useEventStackNavigation();

  const openMenu = () => setVisible(true);
  const closeMenu = () => setVisible(false);

  const menuAnchor = <Item title={'Schedule Options'} iconName={AppIcons.menu} onPress={openMenu} />;

  const handleNavigation = (screen: EventStackComponents) => {
    navigation.push(screen);
    closeMenu();
  };

  return (
    <Menu visible={visible} onDismiss={closeMenu} anchor={menuAnchor}>
      <Menu.Item
        leadingIcon={AppIcons.settings}
        title={'Settings'}
        onPress={() => handleNavigation(EventStackComponents.scheduleSettingsScreen)}
      />
      <Menu.Item
        leadingIcon={AppIcons.help}
        title={'Help'}
        onPress={() => handleNavigation(EventStackComponents.lfgHelpScreen)}
      />
    </Menu>
  );
};
