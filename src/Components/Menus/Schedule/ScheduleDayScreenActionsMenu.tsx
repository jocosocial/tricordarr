import React from 'react';
import {Menu} from 'react-native-paper';
import {Item} from 'react-navigation-header-buttons';

import {AppMenu} from '#src/Components/Menus/AppMenu';
import {ReloadMenuItem} from '#src/Components/Menus/Items/ReloadMenuItem';
import {useConfig} from '#src/Context/Contexts/ConfigContext';
import {AppIcons} from '#src/Enums/Icons';
import {useMenu} from '#src/Hooks/useMenu';
import {CommonStackComponents} from '#src/Navigation/CommonScreens';
import {useScheduleStackNavigation} from '#src/Navigation/Stacks/ScheduleStackNavigator';

interface ScheduleDayScreenActionsMenuProps {
  onRefresh?: () => void;
}
export const ScheduleDayScreenActionsMenu = ({onRefresh}: ScheduleDayScreenActionsMenuProps) => {
  const {visible, openMenu, closeMenu} = useMenu();
  const navigation = useScheduleStackNavigation();
  const {oobeCompleted} = useConfig();

  const menuAnchor = <Item title={'Actions'} iconName={AppIcons.menu} onPress={openMenu} />;

  return (
    <AppMenu visible={visible} onDismiss={closeMenu} anchor={menuAnchor}>
      {onRefresh && <ReloadMenuItem closeMenu={closeMenu} onReload={onRefresh} />}
      <Menu.Item
        title={'Import'}
        leadingIcon={AppIcons.schedImport}
        onPress={() => navigation.push(CommonStackComponents.scheduleImportScreen)}
      />
      <Menu.Item
        title={'Settings'}
        leadingIcon={AppIcons.settings}
        onPress={() => navigation.push(CommonStackComponents.eventSettingsScreen)}
        disabled={!oobeCompleted}
      />
      <Menu.Item
        title={'Help'}
        leadingIcon={AppIcons.help}
        onPress={() => navigation.push(CommonStackComponents.scheduleHelpScreen)}
      />
    </AppMenu>
  );
};
