import {Menu} from 'react-native-paper';
import {AppIcons} from '../../../libraries/Enums/Icons.ts';
import React, {useState} from 'react';
import {Item} from 'react-navigation-header-buttons';
import {CommonStackComponents, useCommonStack} from '../../Navigation/CommonScreens.tsx';

export const ForumCategoryScreenActionsMenu = () => {
  const [visible, setVisible] = useState(false);
  const commonNavigation = useCommonStack();

  const openMenu = () => setVisible(true);
  const closeMenu = () => setVisible(false);

  return (
    <Menu
      visible={visible}
      onDismiss={closeMenu}
      anchor={<Item title={'Actions'} iconName={AppIcons.menu} onPress={openMenu} />}>
      <Menu.Item
        title={'Settings'}
        leadingIcon={AppIcons.settings}
        onPress={() => {
          closeMenu();
          commonNavigation.push(CommonStackComponents.forumSettingsScreen);
        }}
      />
      <Menu.Item
        title={'Help'}
        leadingIcon={AppIcons.help}
        onPress={() => {
          closeMenu();
          commonNavigation.push(CommonStackComponents.forumHelpScreen);
        }}
      />
    </Menu>
  );
};
