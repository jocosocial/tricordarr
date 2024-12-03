import {EventData} from '../../../libraries/Structs/ControllerStructs';
import {useState} from 'react';
import {Menu} from 'react-native-paper';
import {Item} from 'react-navigation-header-buttons';
import {AppIcons} from '../../../libraries/Enums/Icons';
import React from 'react';
import {EventDownloadMenuItem} from './Items/EventDownloadMenuItem';
import {CommonStackComponents, useCommonStack} from '../../Navigation/CommonScreens.tsx';
import {EventType} from '../../../libraries/Enums/EventType.ts';
import {useConfig} from '../../Context/Contexts/ConfigContext.ts';

interface EventScreenActionsMenuProps {
  event: EventData;
}

export const EventScreenActionsMenu = (props: EventScreenActionsMenuProps) => {
  const [visible, setVisible] = useState(false);
  const commonNavigation = useCommonStack();
  const {enablePreregistration} = useConfig();

  const openMenu = () => setVisible(true);
  const closeMenu = () => setVisible(false);

  const handleHelp = () => {
    closeMenu();
    commonNavigation.push(CommonStackComponents.scheduleHelpScreen);
  };

  return (
    <Menu
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
            commonNavigation.push(CommonStackComponents.siteUIScreen, {
              resource: 'performer/shadow/addtoevent',
              id: props.event.eventID,
            });
          }}
          disabled={!enablePreregistration}
        />
      )}
      <Menu.Item title={'Help'} leadingIcon={AppIcons.help} onPress={handleHelp} />
    </Menu>
  );
};
