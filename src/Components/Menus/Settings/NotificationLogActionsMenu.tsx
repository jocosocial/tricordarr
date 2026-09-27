import React from 'react';
import {Menu} from 'react-native-paper';
import {Item} from 'react-navigation-header-buttons';

import {AppMenu} from '#src/Components/Menus/AppMenu';
import {AppIcons} from '#src/Enums/Icons';
import {useMenu} from '#src/Hooks/useMenu';

interface NotificationLogActionsMenuProps {
  onSave: () => void;
  onClear: () => void;
  isClearing: boolean;
  onHelp: () => void;
}

/** Actions menu for NotificationLogScreen's header: Save, Clear, and Help. */
export const NotificationLogActionsMenu = ({onSave, onClear, isClearing, onHelp}: NotificationLogActionsMenuProps) => {
  const {visible, openMenu, closeMenu} = useMenu();

  const handleSave = () => {
    closeMenu();
    onSave();
  };

  const handleClear = () => {
    closeMenu();
    onClear();
  };

  const menuAnchor = <Item title={'Actions'} iconName={AppIcons.menu} onPress={openMenu} />;

  return (
    <AppMenu visible={visible} onDismiss={closeMenu} anchor={menuAnchor}>
      <Menu.Item title={'Save'} leadingIcon={AppIcons.download} onPress={handleSave} />
      <Menu.Item title={'Clear'} leadingIcon={AppIcons.delete} onPress={handleClear} disabled={isClearing} />
      <Menu.Item title={'Help'} leadingIcon={AppIcons.help} onPress={onHelp} />
    </AppMenu>
  );
};
