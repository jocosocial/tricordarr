import React from 'react';
import {Item} from 'react-navigation-header-buttons';

import {AppMenu} from '#src/Components/Menus/AppMenu';
import {ShareMenuItem} from '#src/Components/Menus/Items/ShareMenuItem';
import {useConfig} from '#src/Context/Contexts/ConfigContext';
import {AppIcons} from '#src/Enums/Icons';
import {ShareContentType} from '#src/Enums/ShareContentType';
import {useMenu} from '#src/Hooks/useMenu';

export const MainConductScreenActionsMenu = () => {
  const {visible, openMenu, closeMenu} = useMenu();
  const {appConfig} = useConfig();

  const menuAnchor = <Item title={'Conduct Menu'} iconName={AppIcons.menu} onPress={openMenu} />;
  const conductUrl = `${appConfig.serverUrl}/public/codeofconduct.md`;

  return (
    <AppMenu visible={visible} onDismiss={closeMenu} anchor={menuAnchor}>
      <ShareMenuItem contentType={ShareContentType.siteUI} contentID={conductUrl} closeMenu={closeMenu} />
    </AppMenu>
  );
};
