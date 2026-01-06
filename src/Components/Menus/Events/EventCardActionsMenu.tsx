import {useQueryClient} from '@tanstack/react-query';
import React, {Dispatch, SetStateAction} from 'react';
import {Divider, Menu} from 'react-native-paper';

import {EventDownloadMenuItem} from '#src/Components/Menus/Events/Items/EventDownloadMenuItem';
import {SetOrganizerMenuItem} from '#src/Components/Menus/Events/Items/SetOrganizerMenuItem';
import {SelectableMenuItem} from '#src/Components/Menus/Items/SelectableMenuItem';
import {ShareMenuItem} from '#src/Components/Menus/Items/ShareMenuItem';
import {useRoles} from '#src/Context/Contexts/RoleContext';
import {EventType} from '#src/Enums/EventType';
import {AppIcons} from '#src/Enums/Icons';
import {ShareContentType} from '#src/Enums/ShareContentType';
import {CommonStackComponents, useCommonStack} from '#src/Navigation/CommonScreens';
import {
  useEventNeedsPhotographerMutation,
  useEventPhotographerMutation,
} from '#src/Queries/Events/EventPhotographerMutations';
import {EventData, EventData as EventDataType} from '#src/Structs/ControllerStructs';

interface EventCardActionsMenuProps {
  anchor: React.JSX.Element;
  eventData: EventData;
  menuVisible: boolean;
  setMenuVisible: Dispatch<SetStateAction<boolean>>;
  setRefreshing?: Dispatch<SetStateAction<boolean>>;
}
export const EventCardActionsMenu = (props: EventCardActionsMenuProps) => {
  const commonNavigation = useCommonStack();
  const {hasShutternaut, hasShutternautManager} = useRoles();
  const queryClient = useQueryClient();
  const photographerMutation = useEventPhotographerMutation();
  const needsPhotographerMutation = useEventNeedsPhotographerMutation();

  const closeMenu = () => props.setMenuVisible(false);

  const handleForumPress = () => {
    closeMenu();
    if (props.eventData.forum) {
      commonNavigation.push(CommonStackComponents.forumThreadScreen, {
        forumID: props.eventData.forum,
      });
    }
  };

  const handlePhotographerToggle = () => {
    if (!props.eventData.shutternautData) {
      return;
    }
    photographerMutation.mutate(
      {
        eventID: props.eventData.eventID,
        action: props.eventData.shutternautData.userIsPhotographer ? 'delete' : 'create',
      },
      {
        onSuccess: async () => {
          const invalidations = EventDataType.getCacheKeys(props.eventData.eventID)
            .concat([['/events']])
            .map(key => queryClient.invalidateQueries({queryKey: key}));
          await Promise.all(invalidations);
        },
      },
    );
    closeMenu();
  };

  const handleNeedsPhotographerToggle = () => {
    if (!props.eventData.shutternautData) {
      return;
    }
    needsPhotographerMutation.mutate(
      {
        eventID: props.eventData.eventID,
        action: props.eventData.shutternautData.needsPhotographer ? 'delete' : 'create',
      },
      {
        onSuccess: async () => {
          const invalidations = EventDataType.getCacheKeys(props.eventData.eventID).map(key =>
            queryClient.invalidateQueries({queryKey: key}),
          );
          await Promise.all(invalidations);
        },
      },
    );
    closeMenu();
  };

  return (
    <Menu visible={props.menuVisible} onDismiss={closeMenu} anchor={props.anchor}>
      {props.eventData.eventType === EventType.shadow && (
        <SetOrganizerMenuItem eventID={props.eventData.eventID} closeMenu={closeMenu} />
      )}
      {props.eventData.forum && <Menu.Item title={'Forum'} leadingIcon={AppIcons.forum} onPress={handleForumPress} />}
      <Menu.Item
        title={'Overlapping'}
        leadingIcon={AppIcons.calendarMultiple}
        onPress={() => {
          closeMenu();
          commonNavigation.push(CommonStackComponents.scheduleOverlapScreen, {eventData: props.eventData});
        }}
      />
      <Divider bold={true} />
      <ShareMenuItem contentType={ShareContentType.event} contentID={props.eventData.eventID} closeMenu={closeMenu} />
      <EventDownloadMenuItem closeMenu={closeMenu} event={props.eventData} />
      {(hasShutternaut || hasShutternautManager) && <Divider bold={true} />}
      {hasShutternaut && props.eventData.shutternautData && (
        <SelectableMenuItem
          title={'Photographing'}
          leadingIcon={AppIcons.shutternaut}
          onPress={handlePhotographerToggle}
          selected={props.eventData.shutternautData.userIsPhotographer}
        />
      )}
      {hasShutternautManager && props.eventData.shutternautData && (
        <SelectableMenuItem
          title={'Needs Photographer'}
          leadingIcon={AppIcons.needsPhotographer}
          onPress={handleNeedsPhotographerToggle}
          selected={props.eventData.shutternautData.needsPhotographer}
        />
      )}
    </Menu>
  );
};
