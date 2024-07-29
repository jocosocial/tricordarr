import {PersonalEventData} from '../../../libraries/Structs/ControllerStructs';
import {useState} from 'react';
import {Menu} from 'react-native-paper';
import {Item} from 'react-navigation-header-buttons';
import {AppIcons} from '../../../libraries/Enums/Icons';
import React from 'react';
import {HelpMenuItem} from '../Items/HelpMenuItem';

interface PersonalEventScreenActionsMenuProps {
  event: PersonalEventData;
}

const helpContent = [
  'Personal events are not a way to reserve space.',
  'Confirm that the time your event is shown in Twitarr makes sense with the ships clocks.',
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
