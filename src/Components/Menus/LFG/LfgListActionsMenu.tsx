import React from 'react';
import {Divider, Menu} from 'react-native-paper';
import {Item} from 'react-navigation-header-buttons';

import {AppMenu} from '#src/Components/Menus/AppMenu';
import {AppIcons} from '#src/Enums/Icons';
import {useMenu} from '#src/Hooks/useMenu';
import {CommonStackComponents} from '#src/Navigation/CommonScreens';
import {LfgStackComponents, useLFGStackNavigation, useLFGStackRoute} from '#src/Navigation/Stacks/LFGStackNavigator';

export const LfgListActionsMenu = () => {
  const {visible, openMenu, closeMenu} = useMenu();
  const navigation = useLFGStackNavigation();
  const route = useLFGStackRoute();

  const menuAnchor = <Item title={'Schedule Options'} iconName={AppIcons.menu} onPress={openMenu} />;

  // Check if we're on the former LFGs screen
  const isFormerScreen =
    route.name === LfgStackComponents.lfgListScreen && 'endpoint' in route.params && route.params.endpoint === 'former';

  return (
    <AppMenu visible={visible} onDismiss={closeMenu} anchor={menuAnchor}>
      {!isFormerScreen && (
        <>
          <Menu.Item
            leadingIcon={AppIcons.lfgFormer}
            title={'Former LFGs'}
            onPress={() => navigation.push(LfgStackComponents.lfgListScreen, {endpoint: 'former'})}
          />
          <Divider bold={true} />
        </>
      )}
      <Menu.Item
        leadingIcon={AppIcons.settings}
        title={'Settings'}
        onPress={() => navigation.push(CommonStackComponents.lfgSettingsScreen)}
      />
      <Menu.Item
        leadingIcon={AppIcons.help}
        title={'Help'}
        onPress={() => navigation.push(CommonStackComponents.lfgHelpScreen)}
      />
    </AppMenu>
  );
};
