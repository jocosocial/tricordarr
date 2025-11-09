import React from 'react';
import {Divider, Menu} from 'react-native-paper';
import {Item} from 'react-navigation-header-buttons';

import {AppMenu} from '#src/Components/Menus/AppMenu';
import {AppIcons} from '#src/Enums/Icons';
import {useMenu} from '#src/Hooks/MenuHook';
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
        title={'Favorites'}
        leadingIcon={AppIcons.favorite}
        onPress={() => commonNavigation.push(CommonStackComponents.favoriteUsers)}
      />
      <Menu.Item
        title={'Mutes'}
        leadingIcon={AppIcons.mute}
        onPress={() => commonNavigation.push(CommonStackComponents.muteUsers)}
      />
      <Menu.Item
        title={'Blocks'}
        leadingIcon={AppIcons.block}
        onPress={() => commonNavigation.push(CommonStackComponents.blockUsers)}
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
