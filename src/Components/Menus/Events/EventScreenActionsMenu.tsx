import {useQueryClient} from '@tanstack/react-query';
import React from 'react';
import {Divider, Menu} from 'react-native-paper';
import {Item} from 'react-navigation-header-buttons';

import {AppMenu} from '#src/Components/Menus/AppMenu';
import {EventDownloadMenuItem} from '#src/Components/Menus/Events/Items/EventDownloadMenuItem';
import {SetOrganizerMenuItem} from '#src/Components/Menus/Events/Items/SetOrganizerMenuItem';
import {ShareMenuItem} from '#src/Components/Menus/Items/ShareMenuItem';
import {useConfig} from '#src/Context/Contexts/ConfigContext';
import {usePreRegistration} from '#src/Context/Contexts/PreRegistrationContext';
import {useRoles} from '#src/Context/Contexts/RoleContext';
import {useStyles} from '#src/Context/Contexts/StyleContext';
import {EventType} from '#src/Enums/EventType';
import {AppIcons} from '#src/Enums/Icons';
import {ShareContentType} from '#src/Enums/ShareContentType';
import {useMenu} from '#src/Hooks/useMenu';
import {CommonStackComponents, useCommonStack} from '#src/Navigation/CommonScreens';
import {
  useEventNeedsPhotographerMutation,
  useEventPhotographerMutation,
} from '#src/Queries/Events/EventPhotographerMutations';
import {EventData, EventData as EventDataType} from '#src/Structs/ControllerStructs';

interface EventScreenActionsMenuProps {
  event: EventData;
}

export const EventScreenActionsMenu = (props: EventScreenActionsMenuProps) => {
  const {visible, openMenu, closeMenu} = useMenu();
  const commonNavigation = useCommonStack();
  const {appConfig} = useConfig();
  const {preRegistrationMode} = usePreRegistration();
  const {hasPerformerSelfEditor, hasShutternaut, hasShutternautManager} = useRoles();
  const {commonStyles} = useStyles();
  const queryClient = useQueryClient();
  const photographerMutation = useEventPhotographerMutation();
  const needsPhotographerMutation = useEventNeedsPhotographerMutation();

  const handleHelp = () => {
    closeMenu();
    if (props.event.eventType === EventType.shadow) {
      commonNavigation.push(CommonStackComponents.eventShadowHelpScreen);
    } else {
      // Default to official help screen for official events, fallback to schedule help for any other types
      commonNavigation.push(CommonStackComponents.eventOfficialHelpScreen);
    }
  };

  const handlePhotographerToggle = () => {
    if (!props.event.shutternautData) {
      return;
    }
    photographerMutation.mutate(
      {
        eventID: props.event.eventID,
        action: props.event.shutternautData.userIsPhotographer ? 'delete' : 'create',
      },
      {
        onSuccess: async () => {
          const invalidations = EventDataType.getCacheKeys(props.event.eventID)
            .concat([['/events']])
            .map(key => queryClient.invalidateQueries({queryKey: key}));
          await Promise.all(invalidations);
        },
      },
    );
    closeMenu();
  };

  const handleNeedsPhotographerToggle = () => {
    if (!props.event.shutternautData) {
      return;
    }
    needsPhotographerMutation.mutate(
      {
        eventID: props.event.eventID,
        action: props.event.shutternautData.needsPhotographer ? 'delete' : 'create',
      },
      {
        onSuccess: async () => {
          const invalidations = EventDataType.getCacheKeys(props.event.eventID).map(key =>
            queryClient.invalidateQueries({queryKey: key}),
          );
          await Promise.all(invalidations);
        },
      },
    );
    closeMenu();
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
      {appConfig.enableExperiments && (
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
      )}
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
      {hasShutternaut && props.event.shutternautData && (
        <Menu.Item
          title={'Photographing'}
          leadingIcon={AppIcons.shutternaut}
          onPress={handlePhotographerToggle}
          style={props.event.shutternautData.userIsPhotographer ? commonStyles.surfaceVariant : undefined}
        />
      )}
      {hasShutternautManager && props.event.shutternautData && (
        <Menu.Item
          title={'Needs Photographer'}
          leadingIcon={AppIcons.shutternautManager}
          onPress={handleNeedsPhotographerToggle}
          style={props.event.shutternautData.needsPhotographer ? commonStyles.surfaceVariant : undefined}
        />
      )}
      {(hasShutternaut || hasShutternautManager) && <Divider bold={true} />}
      <Menu.Item title={'Help'} leadingIcon={AppIcons.help} onPress={handleHelp} />
    </AppMenu>
  );
};
