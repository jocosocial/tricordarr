import {EventData, PersonalEventData} from '../../../libraries/Structs/ControllerStructs';
import {useState} from 'react';
import {Menu} from 'react-native-paper';
import {Item} from 'react-navigation-header-buttons';
import {AppIcons} from '../../../libraries/Enums/Icons';
import React from 'react';
import {HelpMenuItem} from '../Items/HelpMenuItem';
import {EventDownloadMenuItem} from '../Events/Items/EventDownloadMenuItem.tsx';

interface PersonalEventScreenActionsMenuProps {
  event: PersonalEventData;
}

const helpContent = [
  'Always check the official daily printed schedule to confirm event times/locations.',
  'Favoriting an event adds it to your schedule and gives you reminder notifications.',
  'All events are given a corresponding forum. You can use that to discuss the event by tapping the forum button in the Menu.',
];

export const PersonalEventScreenActionsMenu = (props: PersonalEventScreenActionsMenuProps) => {
  const [visible, setVisible] = useState(false);

  const openMenu = () => setVisible(true);
  const closeMenu = () => setVisible(false);

  return (
    <Menu
      visible={visible}
      onDismiss={closeMenu}
      anchor={<Item title={'Actions'} iconName={AppIcons.menu} onPress={openMenu} />}>
      <HelpMenuItem closeMenu={closeMenu} helpContent={helpContent} />
    </Menu>
  );
};
