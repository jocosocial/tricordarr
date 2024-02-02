import React, {useState} from 'react';
import {Menu} from 'react-native-paper';
import {AppIcons} from '../../../libraries/Enums/Icons';
import {Item} from 'react-navigation-header-buttons';
import {useEventStackNavigation} from '../../Navigation/Stacks/EventStackNavigator';
import {EventStackComponents} from '../../../libraries/Enums/Navigation';
import {ReloadMenuItem} from '../Items/ReloadMenuItem';
import {Linking} from 'react-native';
import {HelpMenuItem} from '../Items/HelpMenuItem';

export const EventDayScreenActionsMenu = ({onRefresh}: {onRefresh: () => void}) => {
  const [visible, setVisible] = useState(false);
  const navigation = useEventStackNavigation();

  const openMenu = () => setVisible(true);
  const closeMenu = () => setVisible(false);

  const menuAnchor = <Item title={'Actions'} iconName={AppIcons.menu} onPress={openMenu} />;

  const handleNavigation = (component: EventStackComponents) => {
    navigation.push(component);
    closeMenu();
  };

  return (
    <Menu visible={visible} onDismiss={closeMenu} anchor={menuAnchor}>
      <ReloadMenuItem closeMenu={closeMenu} onReload={onRefresh} />
      <HelpMenuItem
        icon={AppIcons.events}
        title={'Subscribe'}
        closeMenu={closeMenu}
        helpContent={['This action is not yet supported. Use Sched instead.']}
      />
      <Menu.Item
        title={'Settings'}
        leadingIcon={AppIcons.settings}
        onPress={() => handleNavigation(EventStackComponents.eventSettingsScreen)}
      />
      <Menu.Item
        title={'Help'}
        leadingIcon={AppIcons.help}
        onPress={() => handleNavigation(EventStackComponents.eventHelpScreen)}
      />
    </Menu>
  );
};
