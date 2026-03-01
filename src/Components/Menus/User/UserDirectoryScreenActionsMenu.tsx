import React from 'react';
import {Divider, Menu} from 'react-native-paper';
import {Item} from 'react-navigation-header-buttons';

import {AppMenu} from '#src/Components/Menus/AppMenu';
import {AppIcons} from '#src/Enums/Icons';
import {useMenu} from '#src/Hooks/useMenu';
import {CommonStackComponents, useCommonStack} from '#src/Navigation/CommonScreens';

export const UserDirectoryScreenActionsMenu = () => {
  const {visible, openMenu, closeMenu} = useMenu();
  const commonNavigation = useCommonStack();

  return (
    <AppMenu
      visible={visible}
      anchor={<Item title={'Actions'} iconName={AppIcons.menu} onPress={openMenu} />}
      onDismiss={closeMenu}>
      <Menu.Item
        title={'Favorite Users'}
        leadingIcon={AppIcons.userFavorite}
        onPress={() => commonNavigation.push(CommonStackComponents.usersList, {mode: 'favorite'})}
      />
      <Menu.Item
        title={'Muted Users'}
        leadingIcon={AppIcons.mute}
        onPress={() => commonNavigation.push(CommonStackComponents.usersList, {mode: 'mute'})}
      />
      <Menu.Item
        title={'Blocked Users'}
        leadingIcon={AppIcons.block}
        onPress={() => commonNavigation.push(CommonStackComponents.usersList, {mode: 'block'})}
      />
      <Divider bold={true} />
      <Menu.Item
        title={'Help'}
        leadingIcon={AppIcons.help}
        onPress={() => commonNavigation.push(CommonStackComponents.userDirectoryHelpScreen)}
      />
    </AppMenu>
  );
};
