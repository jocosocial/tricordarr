import React from 'react';
import {Menu} from 'react-native-paper';

import {AppMenu} from '#src/Components/Menus/AppMenu';
import {ShareMenuItem} from '#src/Components/Menus/Items/ShareMenuItem';
import {MenuAnchor} from '#src/Components/Menus/MenuAnchor';
import {AppIcons} from '#src/Enums/Icons';
import {useMenu} from '#src/Hooks/useMenu';
import {ShareContentType} from '#src/Libraries/Sharing';
import {CommonStackComponents, useCommonStack} from '#src/Navigation/Stacks/Common/CommonStackComponents';

interface HuntActionsMenuProps {
  contentType: ShareContentType.hunt | ShareContentType.puzzle;
  contentID: string;
}

/**
 * Three-dots menu for hunt and puzzle screens: share this item, then help.
 */
export const HuntActionsMenu = ({contentType, contentID}: HuntActionsMenuProps) => {
  const {visible, openMenu, closeMenu} = useMenu();
  const navigation = useCommonStack();

  return (
    <AppMenu
      visible={visible}
      onDismiss={closeMenu}
      anchor={<MenuAnchor title={'Actions'} onPress={openMenu} />}>
      <ShareMenuItem contentType={contentType} contentID={contentID} closeMenu={closeMenu} />
      <Menu.Item
        title={'Help'}
        leadingIcon={AppIcons.help}
        onPress={() => {
          closeMenu();
          navigation.push(CommonStackComponents.huntHelpScreen);
        }}
      />
    </AppMenu>
  );
};
