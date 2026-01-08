import React from 'react';
import {Item} from 'react-navigation-header-buttons';

import {AppMenu} from '#src/Components/Menus/AppMenu';
import {ShareMenuItem} from '#src/Components/Menus/Items/ShareMenuItem';
import {useSwiftarrQueryClient} from '#src/Context/Contexts/SwiftarrQueryClientContext';
import {AppIcons} from '#src/Enums/Icons';
import {ShareContentType} from '#src/Enums/ShareContentType';
import {useMenu} from '#src/Hooks/useMenu';

export const FaqScreenActionsMenu = () => {
  const {visible, openMenu, closeMenu} = useMenu();
  const {serverUrl} = useSwiftarrQueryClient();

  const menuAnchor = <Item title={'FAQ Menu'} iconName={AppIcons.menu} onPress={openMenu} />;
  const faqUrl = `${serverUrl}/public/faq.md`;

  return (
    <AppMenu visible={visible} onDismiss={closeMenu} anchor={menuAnchor}>
      <ShareMenuItem contentType={ShareContentType.siteUI} contentID={faqUrl} closeMenu={closeMenu} />
    </AppMenu>
  );
};
