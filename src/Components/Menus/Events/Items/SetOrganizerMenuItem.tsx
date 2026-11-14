import React, {useCallback} from 'react';
import {Menu} from 'react-native-paper';

import {useSnackbar} from '#src/Context/Contexts/SnackbarContext';
import {AppIcons} from '#src/Enums/Icons';
import {CommonStackComponents, useCommonStack} from '#src/Navigation/Stacks/Common/CommonStackComponents';

interface SetOrganizerMenuItemProps {
  closeMenu: () => void;
  eventID: string;
  disabled?: boolean;
}

/**
 * Opens the add-performer screen for a shadow event. Must render inside a MenuContextBridge.
 */
export const SetOrganizerMenuItem = ({closeMenu, eventID, disabled}: SetOrganizerMenuItemProps) => {
  const {snackbarTry} = useSnackbar();
  const navigation = useCommonStack();

  const handlePress = useCallback(() => {
    closeMenu();
    navigation.push(CommonStackComponents.eventAddPerformerScreen, {eventID: String(eventID)});
  }, [closeMenu, eventID, navigation]);

  return (
    <Menu.Item
      title={'Set Organizer'}
      leadingIcon={AppIcons.performer}
      onPress={snackbarTry(handlePress)}
      disabled={disabled}
    />
  );
};
