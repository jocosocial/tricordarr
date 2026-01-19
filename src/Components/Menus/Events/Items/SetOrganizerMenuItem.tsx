import React from 'react';
import {Menu} from 'react-native-paper';

import {AppIcons} from '#src/Enums/Icons';
import {CommonStackComponents, useCommonStack} from '#src/Navigation/CommonScreens';

interface SetOrganizerMenuItemProps {
  eventID: string | number;
  closeMenu: () => void;
  disabled?: boolean;
}

export const SetOrganizerMenuItem = (props: SetOrganizerMenuItemProps) => {
  const commonNavigation = useCommonStack();

  const handlePress = () => {
    props.closeMenu();
    commonNavigation.push(CommonStackComponents.eventAddPerformerScreen, {
      eventID: String(props.eventID),
    });
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
