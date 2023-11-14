import React, {useState} from 'react';
import {Menu} from 'react-native-paper';
import {AppIcons} from '../../libraries/Enums/Icons';
import {Item} from 'react-navigation-header-buttons';
import {BottomTabComponents, EventStackComponents, LfgStackComponents} from '../../libraries/Enums/Navigation';
import {useLFGStackNavigation} from '../Navigation/Stacks/LFGStackNavigator';
import {useBottomTabNavigator} from '../Navigation/Tabs/BottomTabNavigator';

export const ScheduleLfgListMenu = () => {
  const [visible, setVisible] = useState(false);
  const navigation = useLFGStackNavigation();
  const bottomNavigation = useBottomTabNavigator();

  const openMenu = () => setVisible(true);
  const closeMenu = () => setVisible(false);

  const menuAnchor = <Item title={'Schedule Options'} iconName={AppIcons.menu} onPress={openMenu} />;

  const handleNavigation = (screen: LfgStackComponents) => {
    navigation.push(screen);
    closeMenu();
  };

  return (
    <Menu visible={visible} onDismiss={closeMenu} anchor={menuAnchor}>
      <Menu.Item
        leadingIcon={AppIcons.settings}
        title={'Settings'}
        onPress={() =>
          bottomNavigation.navigate(BottomTabComponents.scheduleTab, {
            screen: EventStackComponents.eventSettingsScreen,
          })
        }
      />
      <Menu.Item
        leadingIcon={AppIcons.help}
        title={'Help'}
        onPress={() => handleNavigation(LfgStackComponents.lfgHelpScreen)}
      />
    </Menu>
  );
};
