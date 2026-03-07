import React, {useCallback} from 'react';
import {Menu} from 'react-native-paper';

import {useSnackbar} from '#src/Context/Contexts/SnackbarContext';
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
  const {snackbarTry} = useSnackbar();

  const handlePress = useCallback(() => {
    props.closeMenu();
    props.onPress();
  }, [props]);

  return (
    <Menu.Item
      title={'Set Organizer'}
      leadingIcon={AppIcons.performer}
      onPress={snackbarTry(handlePress)}
      disabled={props.disabled}
    />
  );
};
