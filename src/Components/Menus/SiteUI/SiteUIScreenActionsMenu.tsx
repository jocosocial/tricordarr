import React, {Dispatch, SetStateAction} from 'react';
import {Alert, Linking} from 'react-native';
import {Menu} from 'react-native-paper';
import {Item} from 'react-navigation-header-buttons';

import {AppMenu} from '#src/Components/Menus/AppMenu';
import {ShareMenuItem} from '#src/Components/Menus/Items/ShareMenuItem';
import {AppIcons} from '#src/Enums/Icons';
import {ShareContentType} from '#src/Enums/ShareContentType';
import {useMenu} from '#src/Hooks/useMenu';
import {useTwitarrWebview} from '#src/Hooks/useTwitarrWebview';
import {CommonStackComponents, useCommonStack} from '#src/Navigation/CommonScreens';

interface SiteUIScreenActionsMenuProps {
  onHome: () => void;
  getCurrentUrl: () => string;
  setKey: Dispatch<SetStateAction<string>>;
}

export const SiteUIScreenActionsMenu = ({onHome, getCurrentUrl, setKey}: SiteUIScreenActionsMenuProps) => {
  const {visible, openMenu, closeMenu} = useMenu();
  const commonNavigation = useCommonStack();
  const {clearCookies} = useTwitarrWebview();

  const handleHome = () => {
    closeMenu();
    onHome();
  };

  const handleHelp = () => {
    closeMenu();
    commonNavigation.push(CommonStackComponents.siteUIHelpScreen);
  };

  const handleClear = () => {
    Alert.alert('Clear Cookies', 'Are you sure you want to clear all webview cookies? You may need to sign in again.', [
      {text: 'Cancel', style: 'cancel', onPress: closeMenu},
      {
        text: 'Clear',
        style: 'destructive',
        onPress: async () => {
          await clearCookies();
          setKey(String(Date.now()));
          closeMenu();
        },
      },
    ]);
  };

  const handleOpenInBrowser = () => {
    closeMenu();
    const currentUrl = getCurrentUrl();
    Linking.openURL(currentUrl).catch(err => {
      console.error('[SiteUIScreenActionsMenu.tsx] Failed to open URL in browser:', err);
    });
  };

  return (
    <AppMenu
      visible={visible}
      onDismiss={closeMenu}
      anchor={<Item title={'Actions'} iconName={AppIcons.menu} onPress={openMenu} />}>
      <Menu.Item title={'Home'} leadingIcon={AppIcons.home} onPress={handleHome} />
      <Menu.Item title={'Open in Browser'} leadingIcon={AppIcons.webview} onPress={handleOpenInBrowser} />
      <ShareMenuItem contentType={ShareContentType.siteUI} contentID={getCurrentUrl()} closeMenu={closeMenu} />
      <Menu.Item title={'Clear Cookies'} leadingIcon={AppIcons.close} onPress={handleClear} />
      <Menu.Item title={'Help'} leadingIcon={AppIcons.help} onPress={handleHelp} />
    </AppMenu>
  );
};
