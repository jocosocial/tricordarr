import React from 'react';
import {Divider, Menu} from 'react-native-paper';

import {EventDownloadMenuItem} from '#src/Components/Menus/Events/Items/EventDownloadMenuItem';
import {NeedsPhotographerMenuItem} from '#src/Components/Menus/Events/Items/NeedsPhotographerMenuItem';
import {PhotographingMenuItem} from '#src/Components/Menus/Events/Items/PhotographingMenuItem';
import {SetOrganizerMenuItem} from '#src/Components/Menus/Events/Items/SetOrganizerMenuItem';
import {ShareMenuItem} from '#src/Components/Menus/Items/ShareMenuItem';
import {useRoles} from '#src/Context/Contexts/RoleContext';
import {EventType} from '#src/Enums/EventType';
import {AppIcons} from '#src/Enums/Icons';
import {ShareContentType} from '#src/Enums/ShareContentType';
import {useMenu} from '#src/Hooks/useMenu';
import {CommonStackComponents, useCommonStack} from '#src/Navigation/CommonScreens';
import {EventData} from '#src/Structs/ControllerStructs';

interface EventCardActionsMenuProps {
  anchor: React.JSX.Element;
  eventData: EventData;
  setRefreshing?: (value: boolean) => void;
}
export const EventCardActionsMenu = (props: EventCardActionsMenuProps) => {
  const {visible, openMenu, closeMenu} = useMenu();
  const commonNavigation = useCommonStack();
  const {hasShutternaut, hasShutternautManager} = useRoles();

  const anchorWithMenu = React.cloneElement(props.anchor, {
    onLongPress: openMenu,
  });

  const handleForumPress = () => {
    if (props.eventData.forum) {
      commonNavigation.push(CommonStackComponents.forumThreadScreen, {
        forumID: props.eventData.forum,
      });
    }
  };

  return (
    <Menu visible={visible} onDismiss={closeMenu} anchor={anchorWithMenu}>
      {props.eventData.forum && <Menu.Item title={'Forum'} leadingIcon={AppIcons.forum} onPress={handleForumPress} />}
      <Menu.Item
        title={'Overlapping'}
        leadingIcon={AppIcons.calendarMultiple}
        onPress={() => commonNavigation.push(CommonStackComponents.scheduleOverlapScreen, {eventData: props.eventData})}
      />
      <Menu.Item
        title={'Photostream'}
        leadingIcon={AppIcons.photostream}
        onPress={() =>
          commonNavigation.push(CommonStackComponents.photostreamEventScreen, {
            eventID: props.eventData.eventID,
          })
        }
      />
      <Divider bold={true} />
      <ShareMenuItem contentType={ShareContentType.event} contentID={props.eventData.eventID} closeMenu={closeMenu} />
      <EventDownloadMenuItem closeMenu={closeMenu} event={props.eventData} />
      {props.eventData.eventType === EventType.shadow && (
        <>
          <Divider bold={true} />
          <SetOrganizerMenuItem eventID={props.eventData.eventID} closeMenu={closeMenu} />
        </>
      )}
      {(hasShutternaut || hasShutternautManager) && <Divider bold={true} />}
      {hasShutternaut && (
        <PhotographingMenuItem
          eventID={props.eventData.eventID}
          shutternautData={props.eventData.shutternautData}
          closeMenu={closeMenu}
        />
      )}
      {hasShutternautManager && (
        <NeedsPhotographerMenuItem
          eventID={props.eventData.eventID}
          shutternautData={props.eventData.shutternautData}
          closeMenu={closeMenu}
        />
      )}
    </Menu>
  );
};
