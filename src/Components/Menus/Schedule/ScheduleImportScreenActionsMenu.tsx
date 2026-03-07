import React, {useCallback} from 'react';
import {Linking} from 'react-native';
import {Menu} from 'react-native-paper';
import {Item} from 'react-navigation-header-buttons';

import {AppMenu} from '#src/Components/Menus/AppMenu';
import {useConfig} from '#src/Context/Contexts/ConfigContext';
import {useSnackbar} from '#src/Context/Contexts/SnackbarContext';
import {AppIcons} from '#src/Enums/Icons';
import {useMenu} from '#src/Hooks/useMenu';
import {createLogger} from '#src/Libraries/Logger';
import {CommonStackComponents, useCommonStack} from '#src/Navigation/CommonScreens';

const logger = createLogger('ScheduleImportScreenActionsMenu.tsx');

export const ScheduleImportScreenActionsMenu = () => {
  const {visible, openMenu, closeMenu} = useMenu();
  const {appConfig} = useConfig();
  const {setSnackbarPayload} = useSnackbar();
  const commonNavigation = useCommonStack();

  const handleOpenInBrowser = useCallback(() => {
    closeMenu();
    Linking.openURL(appConfig.schedBaseUrl).catch(error => {
      logger.error('Failed to open Sched URL in browser.', error);
      setSnackbarPayload({message: 'Unable to open Sched in your browser.', messageType: 'error'});
    });
  }, [appConfig.schedBaseUrl, closeMenu, setSnackbarPayload]);

  const handleCruiseSettings = useCallback(() => {
    closeMenu();
    commonNavigation.push(CommonStackComponents.cruiseSettingsScreen);
  }, [closeMenu, commonNavigation]);

  const handleHelp = useCallback(() => {
    closeMenu();
    commonNavigation.push(CommonStackComponents.scheduleImportHelpScreen);
  }, [closeMenu, commonNavigation]);

  const menuAnchor = <Item title={'Actions'} iconName={AppIcons.menu} onPress={openMenu} />;

  return (
    <AppMenu visible={visible} onDismiss={closeMenu} anchor={menuAnchor}>
      <Menu.Item title={'Open in Browser'} leadingIcon={AppIcons.webview} onPress={handleOpenInBrowser} />
      <Menu.Item title={'Cruise Settings'} leadingIcon={AppIcons.settings} onPress={handleCruiseSettings} />
      <Menu.Item title={'Help'} leadingIcon={AppIcons.help} onPress={handleHelp} />
    </AppMenu>
  );
};
