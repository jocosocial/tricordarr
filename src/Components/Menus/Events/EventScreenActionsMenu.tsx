import React from 'react';
import {Divider, Menu} from 'react-native-paper';
import {Item} from 'react-navigation-header-buttons';

import {AppMenu} from '#src/Components/Menus/AppMenu';
import {EventDownloadMenuItem} from '#src/Components/Menus/Events/Items/EventDownloadMenuItem';
import {NeedsPhotographerMenuItem} from '#src/Components/Menus/Events/Items/NeedsPhotographerMenuItem';
import {PhotographingMenuItem} from '#src/Components/Menus/Events/Items/PhotographingMenuItem';
import {SetOrganizerMenuItem} from '#src/Components/Menus/Events/Items/SetOrganizerMenuItem';
import {ShareMenuItem} from '#src/Components/Menus/Items/ShareMenuItem';
import {usePreRegistration} from '#src/Context/Contexts/PreRegistrationContext';
import {useRoles} from '#src/Context/Contexts/RoleContext';
import {EventType} from '#src/Enums/EventType';
import {AppIcons} from '#src/Enums/Icons';
import {ShareContentType} from '#src/Enums/ShareContentType';
import {useMenu} from '#src/Hooks/useMenu';
import {CommonStackComponents, useCommonStack} from '#src/Navigation/CommonScreens';
import {EventData} from '#src/Structs/ControllerStructs';

interface EventScreenActionsMenuProps {
  event: EventData;
}

export const EventScreenActionsMenu = (props: EventScreenActionsMenuProps) => {
  const {visible, openMenu, closeMenu} = useMenu();
  const commonNavigation = useCommonStack();
  const {preRegistrationMode} = usePreRegistration();
  const {hasPerformerSelfEditor, hasShutternaut, hasShutternautManager} = useRoles();

  const handleHelp = () => {
    if (props.event.eventType === EventType.shadow) {
      commonNavigation.push(CommonStackComponents.eventHelpScreen, {mode: 'shadow'});
    } else {
      // Default to official help screen for official events, fallback to schedule help for any other types
      commonNavigation.push(CommonStackComponents.eventHelpScreen, {mode: 'official'});
    }
  };

  return (
    <AppMenu
      visible={visible}
      onDismiss={closeMenu}
      anchor={<Item title={'Actions'} iconName={AppIcons.menu} onPress={openMenu} />}>
      {props.event.forum && (
        <Menu.Item
          title={'Forum'}
          leadingIcon={AppIcons.forum}
          onPress={() => {
            closeMenu();
            if (props.event.forum) {
              commonNavigation.push(CommonStackComponents.forumThreadScreen, {
                forumID: props.event.forum,
              });
            }
          }}
        />
      )}
      <Menu.Item
        title={'Overlapping'}
        leadingIcon={AppIcons.calendarMultiple}
        onPress={() => {
          closeMenu();
          commonNavigation.push(CommonStackComponents.scheduleOverlapScreen, {eventData: props.event});
        }}
      />
      <Menu.Item
        title={'Photostream'}
        leadingIcon={AppIcons.photostream}
        onPress={() => {
          closeMenu();
          commonNavigation.push(CommonStackComponents.photostreamEventScreen, {
            eventID: props.event.eventID,
          });
        }}
      />
      <Divider bold={true} />
      <ShareMenuItem contentType={ShareContentType.event} contentID={props.event.eventID} closeMenu={closeMenu} />
      <EventDownloadMenuItem closeMenu={closeMenu} event={props.event} />
      {props.event.eventType === EventType.shadow && (
        <SetOrganizerMenuItem
          eventID={props.event.eventID}
          closeMenu={closeMenu}
          disabled={!(preRegistrationMode || hasPerformerSelfEditor)}
        />
      )}
      {(hasShutternaut || hasShutternautManager) && <Divider bold={true} />}
      {hasShutternaut && (
        <PhotographingMenuItem eventID={props.event.eventID} shutternautData={props.event.shutternautData} />
      )}
      {hasShutternautManager && (
        <NeedsPhotographerMenuItem eventID={props.event.eventID} shutternautData={props.event.shutternautData} />
      )}
      {(hasShutternaut || hasShutternautManager) && <Divider bold={true} />}
      <Menu.Item title={'Help'} leadingIcon={AppIcons.help} onPress={handleHelp} />
    </AppMenu>
  );
};
