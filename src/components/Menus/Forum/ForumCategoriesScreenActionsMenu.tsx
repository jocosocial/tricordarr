import React from 'react';
import {Divider, Menu} from 'react-native-paper';
import {AppIcons} from '../../../Libraries/Enums/Icons.ts';
import {Item} from 'react-navigation-header-buttons';
import {CommonStackComponents, useCommonStack} from '../../Navigation/CommonScreens.tsx';
import {AppHeaderMenu} from '../AppHeaderMenu.tsx';

export const ForumCategoriesScreenActionsMenu = () => {
  const [visible, setVisible] = React.useState(false);
  const commonNavigation = useCommonStack();

  const openMenu = () => setVisible(true);
  const closeMenu = () => setVisible(false);

  return (
    <AppHeaderMenu
      visible={visible}
      onDismiss={closeMenu}
      anchor={<Item title={'Actions'} iconName={AppIcons.menu} onPress={openMenu} />}>
      <Menu.Item
        dense={false}
        title={'Alert Keywords'}
        leadingIcon={AppIcons.alertword}
        onPress={() => {
          closeMenu();
          commonNavigation.push(CommonStackComponents.alertKeywords);
        }}
      />
      <Menu.Item
        dense={false}
        title={'Mute Keywords'}
        leadingIcon={AppIcons.mute}
        onPress={() => {
          closeMenu();
          commonNavigation.push(CommonStackComponents.muteKeywords);
        }}
      />
      <Menu.Item
        dense={false}
        title={'Settings'}
        leadingIcon={AppIcons.settings}
        onPress={() => {
          closeMenu();
          commonNavigation.push(CommonStackComponents.forumSettingsScreen);
        }}
      />
      <Divider bold={true} />
      <Menu.Item
        leadingIcon={AppIcons.help}
        title={'Help'}
        onPress={() => {
          closeMenu();
          commonNavigation.push(CommonStackComponents.forumHelpScreen);
        }}
      />
    </AppHeaderMenu>
  );
};
