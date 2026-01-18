import React from 'react';
import {Menu} from 'react-native-paper';
import {Item} from 'react-navigation-header-buttons';

import {AppMenu} from '#src/Components/Menus/AppMenu';
import {ShareMenuItem} from '#src/Components/Menus/Items/ShareMenuItem';
import {useSwiftarrQueryClient} from '#src/Context/Contexts/SwiftarrQueryClientContext';
import {AppIcons} from '#src/Enums/Icons';
import {ShareContentType} from '#src/Enums/ShareContentType';
import {useMenu} from '#src/Hooks/useMenu';
import {CommonStackComponents, useCommonStack} from '#src/Navigation/CommonScreens';

export const MainConductScreenActionsMenu = () => {
  const {visible, openMenu, closeMenu} = useMenu();
  const {serverUrl} = useSwiftarrQueryClient();
  const commonNavigation = useCommonStack();

  const menuAnchor = <Item title={'Conduct Menu'} iconName={AppIcons.menu} onPress={openMenu} />;
  const conductUrl = `${serverUrl}/public/codeofconduct.md`;

  return (
    <AppMenu visible={visible} onDismiss={closeMenu} anchor={menuAnchor}>
      <ShareMenuItem contentType={ShareContentType.siteUI} contentID={conductUrl} closeMenu={closeMenu} />
      <Menu.Item
        title={'Help'}
        leadingIcon={AppIcons.help}
        onPress={() => {
          closeMenu();
          commonNavigation.push(CommonStackComponents.cruiseHelpScreen);
        }}
      />
    </AppMenu>
  );
};
