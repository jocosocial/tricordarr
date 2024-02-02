import {EventData} from '../../../libraries/Structs/ControllerStructs';
import {useState} from 'react';
import {Menu} from 'react-native-paper';
import {Item} from 'react-navigation-header-buttons';
import {AppIcons} from '../../../libraries/Enums/Icons';
import React from 'react';
import {HelpMenuItem} from '../Items/HelpMenuItem';
import {useCommonStack} from '../../Navigation/CommonScreens';
import {SiteUIMenuItem} from '../Items/SiteUIMenuItem';

interface EventScreenActionsMenuProps {
  event: EventData;
}

const helpContent = [
  'Always check the official daily printed schedule to confirm event times/locations.',
  'Favoriting an event adds it to your schedule and gives you reminder notifications.',
  'All events are given a corresponding forum. You can use that to discuss the event by tapping the forum button in the Menu.',
];

export const EventScreenActionsMenu = (props: EventScreenActionsMenuProps) => {
  const [visible, setVisible] = useState(false);

  const openMenu = () => setVisible(true);
  const closeMenu = () => setVisible(false);

  return (
    <Menu
      visible={visible}
      onDismiss={closeMenu}
      anchor={<Item title={'Actions'} iconName={AppIcons.menu} onPress={openMenu} />}>
      <HelpMenuItem icon={AppIcons.download} title={'Download'} closeMenu={closeMenu} helpContent={['This action is not yet supported.']} />
      <HelpMenuItem closeMenu={closeMenu} helpContent={helpContent} />
    </Menu>
  );
};
