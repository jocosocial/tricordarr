import React, {Dispatch, SetStateAction} from 'react';
import {Menu} from 'react-native-paper';
import {AppIcons} from '../../../libraries/Enums/Icons';
import {EventData} from '../../../libraries/Structs/ControllerStructs';
import {CommonStackComponents, useCommonStack} from '../../Navigation/CommonScreens';
import {EventDownloadMenuItem} from './Items/EventDownloadMenuItem';
import {EventType} from '../../../libraries/Enums/EventType.ts';
import {useConfig} from '../../Context/Contexts/ConfigContext.ts';

interface EventCardActionsMenuProps {
  anchor: React.JSX.Element;
  eventData: EventData;
  menuVisible: boolean;
  setMenuVisible: Dispatch<SetStateAction<boolean>>;
  setRefreshing?: Dispatch<SetStateAction<boolean>>;
}
export const EventCardActionsMenu = (props: EventCardActionsMenuProps) => {
  const commonNavigation = useCommonStack();
  const {enablePreregistration} = useConfig();

  const closeMenu = () => props.setMenuVisible(false);

  const handleForumPress = () => {
    closeMenu();
    if (props.eventData.forum) {
      commonNavigation.push(CommonStackComponents.forumThreadScreen, {
        forumID: props.eventData.forum,
      });
    }
  };

  return (
    <Menu visible={props.menuVisible} onDismiss={closeMenu} anchor={props.anchor}>
      {props.eventData.eventType === EventType.shadow && (
        <Menu.Item
          title={'Set Organizer'}
          leadingIcon={AppIcons.performer}
          onPress={() => {
            closeMenu();
            commonNavigation.push(CommonStackComponents.siteUIScreen, {
              resource: 'performer/shadow/addtoevent',
              id: props.eventData.eventID,
            });
          }}
          disabled={!enablePreregistration}
        />
      )}
      {props.eventData.forum && <Menu.Item title={'Forum'} leadingIcon={AppIcons.forum} onPress={handleForumPress} />}
      <EventDownloadMenuItem closeMenu={closeMenu} event={props.eventData} />
    </Menu>
  );
};
