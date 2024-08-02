import React, {useState} from 'react';
import {Menu} from 'react-native-paper';
import {AppIcons} from '../../../libraries/Enums/Icons';
import {Item} from 'react-navigation-header-buttons';
import {LfgStackComponents} from '../../../libraries/Enums/Navigation';
import {useLFGStackNavigation, useLFGStackRoute} from '../../Navigation/Stacks/LFGStackNavigator';

export const ScheduleLfgListMenu = () => {
  const [visible, setVisible] = useState(false);
  const navigation = useLFGStackNavigation();
  const route = useLFGStackRoute();

  const openMenu = () => setVisible(true);
  const closeMenu = () => setVisible(false);

  const menuAnchor = <Item title={'Schedule Options'} iconName={AppIcons.menu} onPress={openMenu} />;

  const handleNavigation = (screen: LfgStackComponents) => {
    if (route.name === screen) {
      closeMenu();
      return;
    }
    navigation.push(screen);
    closeMenu();
  };

  return (
    <Menu visible={visible} onDismiss={closeMenu} anchor={menuAnchor}>
      <Menu.Item
        leadingIcon={AppIcons.settings}
        title={'Settings'}
        onPress={() => handleNavigation(LfgStackComponents.lfgSettingsScreen)}
      />
      <Menu.Item
        leadingIcon={AppIcons.help}
        title={'Help'}
        onPress={() => handleNavigation(LfgStackComponents.lfgHelpScreen)}
      />
    </Menu>
  );
};
