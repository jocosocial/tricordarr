import {EventData} from '#src/Structs/ControllerStructs';
import {useState} from 'react';
import {Menu} from 'react-native-paper';
import {Item} from 'react-navigation-header-buttons';
import {AppIcons} from '#src/Enums/Icons';
import React from 'react';
import {EventDownloadMenuItem} from '#src/Components/Menus/Events/Items/EventDownloadMenuItem';
import {CommonStackComponents, useCommonStack} from '#src/Navigation/CommonScreens';
import {EventType} from '#src/Enums/EventType';
import {useConfig} from '#src/Context/Contexts/ConfigContext';
import {AppHeaderMenu} from '#src/Components/Menus/AppHeaderMenu';

interface EventScreenActionsMenuProps {
  event: EventData;
}

export const EventScreenActionsMenu = (props: EventScreenActionsMenuProps) => {
  const [visible, setVisible] = useState(false);
  const commonNavigation = useCommonStack();
  const {preRegistrationAvailable} = useConfig();

  const openMenu = () => setVisible(true);
  const closeMenu = () => setVisible(false);

  const handleHelp = () => {
    closeMenu();
    commonNavigation.push(CommonStackComponents.scheduleHelpScreen);
  };

  return (
    <AppHeaderMenu
      visible={visible}
      onDismiss={closeMenu}
      anchor={<Item title={'Actions'} iconName={AppIcons.menu} onPress={openMenu} />}>
      <EventDownloadMenuItem closeMenu={closeMenu} event={props.event} />
      {props.event.eventType === EventType.shadow && (
        <Menu.Item
          title={'Set Organizer'}
          leadingIcon={AppIcons.performer}
          onPress={() => {
            closeMenu();
            commonNavigation.push(CommonStackComponents.eventAddPerformerScreen, {
              eventID: props.event.eventID,
            });
          }}
          disabled={!preRegistrationAvailable}
        />
      )}
      <Menu.Item title={'Help'} leadingIcon={AppIcons.help} onPress={handleHelp} />
    </AppHeaderMenu>
  );
};
