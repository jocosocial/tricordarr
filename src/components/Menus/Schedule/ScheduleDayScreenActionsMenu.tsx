import React, {useState} from 'react';
import {Menu} from 'react-native-paper';
import {AppIcons} from '../../../libraries/Enums/Icons.ts';
import {Item} from 'react-navigation-header-buttons';
import {ScheduleStackComponents, useScheduleStackNavigation} from '../../Navigation/Stacks/ScheduleStackNavigator.tsx';
import {ReloadMenuItem} from '../Items/ReloadMenuItem.tsx';
import {CommonStackComponents} from '../../Navigation/CommonScreens.tsx';
import {AppHeaderMenu} from '../AppHeaderMenu.tsx';

interface ScheduleDayScreenActionsMenuProps {
  onRefresh?: () => void;
  oobe?: boolean;
}
export const ScheduleDayScreenActionsMenu = ({onRefresh, oobe}: ScheduleDayScreenActionsMenuProps) => {
  const [visible, setVisible] = useState(false);
  const navigation = useScheduleStackNavigation();

  const openMenu = () => setVisible(true);
  const closeMenu = () => setVisible(false);

  const menuAnchor = <Item title={'Actions'} iconName={AppIcons.menu} onPress={openMenu} />;

  const handleNavigation = (component: ScheduleStackComponents | CommonStackComponents) => {
    navigation.push(component);
    closeMenu();
  };

  return (
    <AppHeaderMenu visible={visible} onDismiss={closeMenu} anchor={menuAnchor}>
      {onRefresh && <ReloadMenuItem closeMenu={closeMenu} onReload={onRefresh} />}
      <Menu.Item
        title={'Import'}
        leadingIcon={AppIcons.schedImport}
        onPress={() => handleNavigation(CommonStackComponents.scheduleImportScreen)}
      />
      {!oobe && (
        <Menu.Item
          title={'Settings'}
          leadingIcon={AppIcons.settings}
          onPress={() => handleNavigation(ScheduleStackComponents.eventSettingsScreen)}
        />
      )}
      <Menu.Item
        title={'Help'}
        leadingIcon={AppIcons.help}
        onPress={() => handleNavigation(CommonStackComponents.scheduleHelpScreen)}
      />
    </AppHeaderMenu>
  );
};
