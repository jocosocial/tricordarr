import React from 'react';
import {Menu} from 'react-native-paper';
import {Item} from 'react-navigation-header-buttons';

import {AppMenu} from '#src/Components/Menus/AppMenu';
import {AppIcons} from '#src/Enums/Icons';
import {useMenu} from '#src/Hooks/useMenu';
import {CommonStackComponents} from '#src/Navigation/CommonScreens';
import {MainStackComponents, useMainStack} from '#src/Navigation/Stacks/MainStackNavigator';

export const PhotostreamActionsMenu = () => {
  const {visible, openMenu, closeMenu} = useMenu();
  const navigation = useMainStack();

  return (
    <AppMenu
      visible={visible}
      onDismiss={closeMenu}
      anchor={<Item title={'Actions'} iconName={AppIcons.menu} onPress={openMenu} />}>
      <Menu.Item
        title={'Image Settings'}
        onPress={() => {
          closeMenu();
          navigation.push(CommonStackComponents.imageSettingsScreen);
        }}
        leadingIcon={AppIcons.settings}
      />
      <Menu.Item
        title={'Help'}
        onPress={() => {
          closeMenu();
          navigation.push(MainStackComponents.photostreamHelpScreen);
        }}
        leadingIcon={AppIcons.help}
      />
    </AppMenu>
  );
};
