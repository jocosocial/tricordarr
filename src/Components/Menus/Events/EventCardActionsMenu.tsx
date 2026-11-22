import React from 'react';
import {Divider, Menu} from 'react-native-paper';

import {EventDownloadMenuItem} from '#src/Components/Menus/Events/Items/EventDownloadMenuItem';
import {ManagePerformersMenuItem} from '#src/Components/Menus/Events/Items/ManagePerformersMenuItem';
import {NeedsPhotographerMenuItem} from '#src/Components/Menus/Events/Items/NeedsPhotographerMenuItem';
import {OpenInSchedMenuItem} from '#src/Components/Menus/Events/Items/OpenInSchedMenuItem';
import {PhotographingMenuItem} from '#src/Components/Menus/Events/Items/PhotographingMenuItem';
import {SetOrganizerMenuItem} from '#src/Components/Menus/Events/Items/SetOrganizerMenuItem';
import {ShareMenuItem} from '#src/Components/Menus/Items/ShareMenuItem';
import {MenuContextBridge, useMenuContextBridge} from '#src/Components/Menus/MenuContextBridge';
import {PrivilegedMenuGroup} from '#src/Components/Menus/PrivilegedMenuGroup';
import {usePrivilege} from '#src/Context/Contexts/PrivilegeContext';
import {useRoles} from '#src/Context/Contexts/RoleContext';
import {EventType} from '#src/Enums/EventType';
import {AppIcons} from '#src/Enums/Icons';
import {useMenu} from '#src/Hooks/useMenu';
import {useMenuBottomInset} from '#src/Hooks/useMenuBottomInset';
import {ShareContentType} from '#src/Libraries/Sharing';
import {CommonStackComponents, useCommonStack} from '#src/Navigation/Stacks/Common/CommonStackComponents';
import {EventData} from '#src/Structs/ControllerStructs';

interface EventCardActionsMenuItemsProps {
  eventData: EventData;
  closeMenu: () => void;
}

/**
 * The items of an event's long-press actions menu, without the surrounding Menu. Shared by
 * EventCardActionsMenu (list cards, anchored on the card) and DayPlannerCardActionsMenu
 * (planner cards, anchored at the touch point) so both offer the same actions.
 * Must render inside a MenuContextBridge.
 */
export const EventCardActionsMenuItems = ({eventData, closeMenu}: EventCardActionsMenuItemsProps) => {
  const commonNavigation = useCommonStack();
  const {hasShutternaut, hasShutternautManager} = useRoles();
  const {hasTwitarrTeam} = usePrivilege();
  const isShadow = eventData.eventType === EventType.shadow;

  const handleForumPress = () => {
    if (eventData.forum) {
      commonNavigation.push(CommonStackComponents.forumThreadScreen, {
        forumID: eventData.forum,
      });
    }
  };

  return (
    <>
      {eventData.forum && <Menu.Item title={'Forum'} leadingIcon={AppIcons.forum} onPress={handleForumPress} />}
      <Menu.Item
        title={'Overlapping'}
        leadingIcon={AppIcons.calendarMultiple}
        onPress={() => commonNavigation.push(CommonStackComponents.scheduleOverlapScreen, {eventData: eventData})}
      />
      <Menu.Item
        title={'Photostream'}
        leadingIcon={AppIcons.photostream}
        onPress={() =>
          commonNavigation.push(CommonStackComponents.photostreamEventScreen, {
            eventID: eventData.eventID,
          })
        }
      />
      <Divider bold={true} />
      <EventDownloadMenuItem closeMenu={closeMenu} event={eventData} />
      <OpenInSchedMenuItem closeMenu={closeMenu} eventUid={eventData.uid} />
      {isShadow && <SetOrganizerMenuItem closeMenu={closeMenu} eventID={eventData.eventID} />}
      <PrivilegedMenuGroup>
        {hasTwitarrTeam && <ManagePerformersMenuItem eventID={eventData.eventID} />}
        {hasShutternaut && <PhotographingMenuItem event={eventData} closeMenu={closeMenu} />}
        {hasShutternautManager && <NeedsPhotographerMenuItem event={eventData} closeMenu={closeMenu} />}
      </PrivilegedMenuGroup>
      <ShareMenuItem contentType={ShareContentType.event} contentID={eventData.eventID} closeMenu={closeMenu} />
    </>
  );
};

interface EventCardActionsMenuProps {
  anchor: React.JSX.Element;
  eventData: EventData;
  setRefreshing?: (value: boolean) => void;
}

/**
 * Long-press actions menu for an event list card. The anchor card gets an `onLongPress` injected
 * that opens the menu.
 */
export const EventCardActionsMenu = (props: EventCardActionsMenuProps) => {
  const {visible, openMenu, closeMenu} = useMenu();
  const bridged = useMenuContextBridge();
  const bottomInset = useMenuBottomInset();

  const anchorWithMenu = React.cloneElement(props.anchor, {
    onLongPress: openMenu,
  });

  return (
    <Menu bottomInset={bottomInset} visible={visible} onDismiss={closeMenu} anchor={anchorWithMenu}>
      <MenuContextBridge bridged={bridged}>
        <EventCardActionsMenuItems eventData={props.eventData} closeMenu={closeMenu} />
      </MenuContextBridge>
    </Menu>
  );
};
