import React from 'react';
import {Menu} from 'react-native-paper';

import {DataFieldListItem} from '#src/Components/Lists/Items/DataFieldListItem';
import {AppMenu} from '#src/Components/Menus/AppMenu';
import {AppIcons} from '#src/Enums/Icons';
import {useMenu} from '#src/Hooks/useMenu';
import {getRoomName} from '#src/Libraries/Ship';
import {CommonStackComponents, useCommonStack} from '#src/Navigation/Stacks/Common/CommonStackComponents';

interface EventLocationActionsMenuProps {
  location: string;
  cruiseDay?: number;
  onPress: () => void;
  /**
   * When true, long press includes Reports In This Room. Off by default.
   */
  enableReports?: boolean;
}

/**
 * Location field: tap opens the deck map; long press offers room-scoped lists.
 */
export const EventLocationActionsMenu = ({
  location,
  cruiseDay,
  onPress,
  enableReports = false,
}: EventLocationActionsMenuProps) => {
  const {visible, openMenu, closeMenu} = useMenu();
  const navigation = useCommonStack();
  const roomName = getRoomName(location);

  const handleReports = () => {
    navigation.push(CommonStackComponents.adminEventFeedbackReportsScreen, {location: roomName});
  };

  const handleEvents = () => {
    navigation.push(CommonStackComponents.eventLocationScreen, {
      location: roomName,
      cruiseDay,
    });
  };

  return (
    <AppMenu
      visible={visible}
      onDismiss={closeMenu}
      anchor={
        <DataFieldListItem
          icon={AppIcons.map}
          title={'Location'}
          description={location}
          onPress={onPress}
          onLongPress={roomName ? openMenu : undefined}
        />
      }>
      {enableReports && (
        <Menu.Item title={'Reports In This Location'} leadingIcon={AppIcons.feedback} onPress={handleReports} />
      )}
      <Menu.Item title={'Events In This Location'} leadingIcon={AppIcons.events} onPress={handleEvents} />
    </AppMenu>
  );
};
