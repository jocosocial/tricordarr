import Clipboard from '@react-native-clipboard/clipboard';
import React from 'react';
import {Linking} from 'react-native';
import {Menu} from 'react-native-paper';
import {Item} from 'react-navigation-header-buttons';

import {AppHeaderMenu} from '#src/Components/Menus/AppHeaderMenu';
import {AppIcons} from '#src/Enums/Icons';
import {useMenu} from '#src/Hooks/MenuHook';
import {CommonStackComponents, useCommonStack} from '#src/Navigation/CommonScreens';

interface SiteUIScreenActionsMenuProps {
  onHome: () => void;
  onBack: () => void;
  canGoBack: boolean;
  oobe?: boolean;
  getCurrentUrl: () => string;
}

export const SiteUIScreenActionsMenu = ({
  onHome,
  onBack,
  canGoBack,
  oobe,
  getCurrentUrl,
}: SiteUIScreenActionsMenuProps) => {
  const {visible, openMenu, closeMenu} = useMenu();
  const commonNavigation = useCommonStack();

  const handleHome = () => {
    closeMenu();
    onHome();
  };

  const handleBack = () => {
    closeMenu();
    onBack();
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
    <AppHeaderMenu
      visible={visible}
      onDismiss={closeMenu}
      anchor={<Item title={'Actions'} iconName={AppIcons.menu} onPress={openMenu} />}>
      <Menu.Item title={'Back'} leadingIcon={AppIcons.back} onPress={handleBack} disabled={!canGoBack} />
      <Menu.Item title={'Home'} leadingIcon={AppIcons.home} onPress={handleHome} />
      <Menu.Item title={'Open in Browser'} leadingIcon={AppIcons.webview} onPress={handleOpenInBrowser} />
      <Menu.Item title={'Copy URL'} leadingIcon={AppIcons.copy} onPress={handleCopyUrl} />
      <Menu.Item title={'Help'} leadingIcon={AppIcons.help} onPress={handleHelp} />
    </AppHeaderMenu>
  );
};
