import React from 'react';
import {Menu} from 'react-native-paper';

import {AppIcons} from '#src/Enums/Icons';

interface SetOrganizerMenuItemProps {
  closeMenu: () => void;
  onPress: () => void;
  disabled?: boolean;
}

/**
 * Menu items portal up to the Portal.Host which likely does not have the navigators available.
 */
export const SetOrganizerMenuItem = (props: SetOrganizerMenuItemProps) => {
  const handlePress = () => {
    props.closeMenu();
    props.onPress();
  };

  return (
    <Menu.Item
      title={'Set Organizer'}
      leadingIcon={AppIcons.performer}
      onPress={handlePress}
      disabled={props.disabled}
    />
  );
};
