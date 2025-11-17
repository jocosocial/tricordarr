import Clipboard from '@react-native-clipboard/clipboard';
import React from 'react';
import {Linking} from 'react-native';
import {Menu} from 'react-native-paper';
import {Item} from 'react-navigation-header-buttons';

import {AppMenu} from '#src/Components/Menus/AppMenu';
import {ShareMenuItem} from '#src/Components/Menus/Items/ShareMenuItem';
import {AppIcons} from '#src/Enums/Icons';
import {ShareContentType} from '#src/Enums/ShareContentType';
import {useMenu} from '#src/Hooks/useMenu';
import {CommonStackComponents, useCommonStack} from '#src/Navigation/CommonScreens';

interface SiteUIScreenActionsMenuProps {
  onHome: () => void;
  oobe?: boolean;
  getCurrentUrl: () => string;
}

export const SiteUIScreenActionsMenu = ({onHome, oobe, getCurrentUrl}: SiteUIScreenActionsMenuProps) => {
  const {visible, openMenu, closeMenu} = useMenu();
  const commonNavigation = useCommonStack();

  const handleHome = () => {
    closeMenu();
    onHome();
  };

  const handleHelp = () => {
    closeMenu();
    commonNavigation.push(CommonStackComponents.siteUIHelpScreen, {oobe: oobe});
  };

  const handleOpenInBrowser = () => {
    closeMenu();
    const currentUrl = getCurrentUrl();
    Linking.openURL(currentUrl).catch(err => {
      console.error('[SiteUIScreenActionsMenu.tsx] Failed to open URL in browser:', err);
    });
  };

  const handleCopyUrl = () => {
    closeMenu();
    const currentUrl = getCurrentUrl();
    Clipboard.setString(currentUrl);
  };

  return (
    <AppMenu
      visible={visible}
      onDismiss={closeMenu}
      anchor={<Item title={'Actions'} iconName={AppIcons.menu} onPress={openMenu} />}>
      <Menu.Item title={'Home'} leadingIcon={AppIcons.home} onPress={handleHome} />
      <Menu.Item title={'Open in Browser'} leadingIcon={AppIcons.webview} onPress={handleOpenInBrowser} />
      <ShareMenuItem contentType={ShareContentType.siteUI} contentID={getCurrentUrl()} closeMenu={closeMenu} />
      <Menu.Item title={'Help'} leadingIcon={AppIcons.help} onPress={handleHelp} />
    </AppMenu>
  );
};
