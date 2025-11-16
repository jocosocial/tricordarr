import React from 'react';
import {Item} from 'react-navigation-header-buttons';

import {AppMenu} from '#src/Components/Menus/AppMenu';
import {ShareMenuItem} from '#src/Components/Menus/Items/ShareMenuItem';
import {useConfig} from '#src/Context/Contexts/ConfigContext';
import {AppIcons} from '#src/Enums/Icons';
import {ShareContentType} from '#src/Enums/ShareContentType';
import {useMenu} from '#src/Hooks/MenuHook';

export const FaqScreenActionsMenu = () => {
  const {visible, openMenu, closeMenu} = useMenu();
  const {appConfig} = useConfig();

  const menuAnchor = <Item title={'FAQ Menu'} iconName={AppIcons.menu} onPress={openMenu} />;
  const faqUrl = `${appConfig.serverUrl}/public/faq.md`;

  return (
    <AppMenu visible={visible} onDismiss={closeMenu} anchor={menuAnchor}>
      <ShareMenuItem contentType={ShareContentType.siteUI} contentID={faqUrl} closeMenu={closeMenu} />
    </AppMenu>
  );
};
