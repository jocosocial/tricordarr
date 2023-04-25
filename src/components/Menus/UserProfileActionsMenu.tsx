import * as React from 'react';
import {Divider, Menu} from 'react-native-paper';
import {NavBarIconButton} from '../Buttons/IconButtons/NavBarIconButton';
import {ProfilePublicData} from '../../libraries/Structs/ControllerStructs';
import {AppIcons} from '../../libraries/Enums/Icons';

interface UserProfileActionsMenuProps {
  profile: ProfilePublicData;
}

export const UserProfileActionsMenu = ({profile}: UserProfileActionsMenuProps) => {
  const [visible, setVisible] = React.useState(false);

  const openMenu = () => setVisible(true);
  const closeMenu = () => setVisible(false);

  return (
    <Menu visible={visible} onDismiss={closeMenu} anchor={<NavBarIconButton icon={AppIcons.menu} onPress={openMenu} />}>
      <Menu.Item leadingIcon={AppIcons.favorite} title={'Favorite'} />
      <Menu.Item leadingIcon={AppIcons.privateNoteEdit} title={'Add Private Note'} />
      <Divider bold={true} />
      <Menu.Item leadingIcon={AppIcons.block} title={'Block'} />
      <Menu.Item leadingIcon={AppIcons.mute} title={'Mute'} />
      <Menu.Item leadingIcon={AppIcons.report} title={'Report'} />
      <Divider bold={true} />
      <Menu.Item leadingIcon={AppIcons.moderator} title={'Moderate'} />
    </Menu>
  );
};
