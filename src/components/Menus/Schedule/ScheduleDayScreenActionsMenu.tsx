import React, {useState} from 'react';
import {Menu} from 'react-native-paper';
import {AppIcons} from '../../../Libraries/Enums/Icons.ts';
import {Item} from 'react-navigation-header-buttons';
import {useScheduleStackNavigation} from '../../Navigation/Stacks/ScheduleStackNavigator.tsx';
import {ReloadMenuItem} from '../Items/ReloadMenuItem.tsx';
import {CommonStackComponents} from '../../Navigation/CommonScreens.tsx';
import {AppHeaderMenu} from '../AppHeaderMenu.tsx';
import {useConfig} from '../../Context/Contexts/ConfigContext.ts';

interface ScheduleDayScreenActionsMenuProps {
  onRefresh?: () => void;
}
export const ScheduleDayScreenActionsMenu = ({onRefresh}: ScheduleDayScreenActionsMenuProps) => {
  const [visible, setVisible] = useState(false);
  const navigation = useScheduleStackNavigation();
  const {oobeCompleted} = useConfig();

  const openMenu = () => setVisible(true);
  const closeMenu = () => setVisible(false);

  const menuAnchor = <Item title={'Actions'} iconName={AppIcons.menu} onPress={openMenu} />;

  const handleNavigation = (component: CommonStackComponents) => {
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
      <Menu.Item
        title={'Settings'}
        leadingIcon={AppIcons.settings}
        onPress={() => handleNavigation(CommonStackComponents.eventSettingsScreen)}
        disabled={!oobeCompleted}
      />
      <Menu.Item
        title={'Help'}
        leadingIcon={AppIcons.help}
        onPress={() => handleNavigation(CommonStackComponents.scheduleHelpScreen)}
      />
    </AppHeaderMenu>
  );
};
