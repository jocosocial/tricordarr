import React from 'react';
import {Menu} from 'react-native-paper';
import {Item} from 'react-navigation-header-buttons';

import {AppMenu} from '#src/Components/Menus/AppMenu';
import {ReloadMenuItem} from '#src/Components/Menus/Items/ReloadMenuItem';
import {AppIcons} from '#src/Enums/Icons';
import {useMenu} from '#src/Hooks/useMenu';
import {CommonStackComponents, useCommonStack} from '#src/Navigation/Stacks/Common/CommonStackComponents';

interface MapScreenActionsMenuProps {
  onReload: () => void;
}

export const MapScreenActionsMenu = ({onReload}: MapScreenActionsMenuProps) => {
  const {visible, openMenu, closeMenu} = useMenu();
  const navigation = useCommonStack();

  const menuAnchor = <Item title={'Actions'} iconName={AppIcons.menu} onPress={openMenu} />;

  return (
    <AppMenu visible={visible} onDismiss={closeMenu} anchor={menuAnchor}>
      <ReloadMenuItem closeMenu={closeMenu} onReload={onReload} />
      <Menu.Item
        title={'Settings'}
        leadingIcon={AppIcons.settings}
        onPress={() => {
          closeMenu();
          navigation.push(CommonStackComponents.cruiseSettingsScreen);
        }}
      />
      <Menu.Item
        title={'Help'}
        leadingIcon={AppIcons.help}
        onPress={() => {
          closeMenu();
          navigation.push(CommonStackComponents.mapHelpScreen);
        }}
      />
    </AppMenu>
  );
};
