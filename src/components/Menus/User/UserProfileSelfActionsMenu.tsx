import * as React from 'react';
import {useState} from 'react';
import {Menu} from 'react-native-paper';
import {AppIcons} from '../../../Libraries/Enums/Icons.ts';
import {Item} from 'react-navigation-header-buttons';
import {CommonStackComponents, useCommonStack} from '../../Navigation/CommonScreens.tsx';
import {AppHeaderMenu} from '../AppHeaderMenu.tsx';

/**
 * Actions menu for when you're viewing your own profile.
 */
export const UserProfileSelfActionsMenu = () => {
  const [visible, setVisible] = useState(false);
  const commonNavigation = useCommonStack();

  const openMenu = () => setVisible(true);
  const closeMenu = () => setVisible(false);

  const handleHelp = () => {
    closeMenu();
    commonNavigation.push(CommonStackComponents.userProfileHelpScreen);
  };

  return (
    <AppHeaderMenu
      visible={visible}
      onDismiss={closeMenu}
      anchor={<Item title={'Actions'} iconName={AppIcons.menu} onPress={openMenu} />}>
      <Menu.Item leadingIcon={AppIcons.help} title={'Help'} onPress={handleHelp} />
    </AppHeaderMenu>
  );
};
