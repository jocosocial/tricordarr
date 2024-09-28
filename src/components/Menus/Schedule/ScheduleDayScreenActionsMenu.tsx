import React, {useState} from 'react';
import {Menu} from 'react-native-paper';
import {AppIcons} from '../../../libraries/Enums/Icons.ts';
import {Item} from 'react-navigation-header-buttons';
import {useEventStackNavigation} from '../../Navigation/Stacks/EventStackNavigator.tsx';
import {EventStackComponents} from '../../../libraries/Enums/Navigation.ts';
import {ReloadMenuItem} from '../Items/ReloadMenuItem.tsx';
import {CommonStackComponents} from '../../Navigation/CommonScreens.tsx';

export const ScheduleDayScreenActionsMenu = ({onRefresh}: {onRefresh?: () => void}) => {
  const [visible, setVisible] = useState(false);
  const navigation = useEventStackNavigation();

  const openMenu = () => setVisible(true);
  const closeMenu = () => setVisible(false);

  const menuAnchor = <Item title={'Actions'} iconName={AppIcons.menu} onPress={openMenu} />;

  const handleNavigation = (component: EventStackComponents | CommonStackComponents) => {
    navigation.push(component);
    closeMenu();
  };

  return (
    <Menu visible={visible} onDismiss={closeMenu} anchor={menuAnchor}>
      {onRefresh && <ReloadMenuItem closeMenu={closeMenu} onReload={onRefresh} />}
      <Menu.Item
        title={'Import'}
        leadingIcon={AppIcons.schedImport}
        onPress={() => handleNavigation(EventStackComponents.scheduleImportScreen)}
      />
      <Menu.Item
        title={'Settings'}
        leadingIcon={AppIcons.settings}
        onPress={() => handleNavigation(EventStackComponents.eventSettingsScreen)}
      />
      <Menu.Item
        title={'Help'}
        leadingIcon={AppIcons.help}
        onPress={() => handleNavigation(CommonStackComponents.scheduleHelpScreen)}
      />
    </Menu>
  );
};
