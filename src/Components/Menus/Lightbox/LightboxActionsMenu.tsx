import React from 'react';
import {Menu} from 'react-native-paper';
import {Item} from 'react-navigation-header-buttons';

import {AppMenu} from '#src/Components/Menus/AppMenu';
import {useAppTheme} from '#src/Context/Contexts/ThemeContext';
import {AppIcons} from '#src/Enums/Icons';
import {useMenu} from '#src/Hooks/useMenu';
import {push} from '#src/Libraries/NavigationRef';
import {CommonStackComponents} from '#src/Navigation/Stacks/Common/CommonStackComponents';

interface LightboxActionsMenuProps {
  onPressSave?: () => void;
  onPressShare?: () => void;
  onRequestClose: () => void;
}

/**
 * Actions menu for the image lightbox header: download, image settings, and share. Settings
 * dismisses the lightbox first and then pushes onto whatever screen is underneath, via the global
 * navigation ref because the lightbox renders outside every navigator.
 */
export const LightboxActionsMenu = ({onPressSave, onPressShare, onRequestClose}: LightboxActionsMenuProps) => {
  const {visible, openMenu, closeMenu} = useMenu();
  const {theme} = useAppTheme();

  return (
    <AppMenu
      visible={visible}
      onDismiss={closeMenu}
      anchor={
        <Item title={'Actions'} iconName={AppIcons.menu} color={theme.colors.onImageViewer} onPress={openMenu} />
      }>
      {onPressSave && (
        <Menu.Item
          title={'Download'}
          leadingIcon={AppIcons.download}
          onPress={() => {
            closeMenu();
            onPressSave();
          }}
        />
      )}
      <Menu.Item
        title={'Settings'}
        leadingIcon={AppIcons.settings}
        onPress={() => {
          closeMenu();
          onRequestClose();
          push(CommonStackComponents.imageSettingsScreen);
        }}
      />
      {onPressShare && (
        <Menu.Item
          title={'Share'}
          leadingIcon={AppIcons.share}
          onPress={() => {
            closeMenu();
            onPressShare();
          }}
        />
      )}
    </AppMenu>
  );
};
