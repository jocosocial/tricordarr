import * as React from 'react';
import {Divider, Menu, Modal} from 'react-native-paper';
import {NavBarIconButton} from '../Buttons/IconButtons/NavBarIconButton';
import {ProfilePublicData} from '../../libraries/Structs/ControllerStructs';
import {AppIcons} from '../../libraries/Enums/Icons';
import {useStyles} from '../Context/Contexts/StyleContext';
import {ReactNode, useState} from 'react';
import {ReportModalView} from '../Views/Modals/ReportModalView';
import {useModal} from '../Context/Contexts/ModalContext';

interface UserProfileActionsMenuProps {
  profile: ProfilePublicData;
}

export const UserProfileActionsMenu = ({profile}: UserProfileActionsMenuProps) => {
  const [visible, setVisible] = useState(false);
  const {setModalContent, setModalVisible} = useModal();

  const openMenu = () => setVisible(true);
  const closeMenu = () => setVisible(false);

  const handleModerate = () => console.log('Navigating to moderate user', profile.header.username);
  const handleFavorite = () => console.log('Triggering favorite mutation');
  const handleRegCode = () => console.log('Navigating to reg code');
  const handleModal = (content: ReactNode) => {
    closeMenu();
    setModalContent(content);
    setModalVisible(true);
  };

  return (
    <Menu visible={visible} onDismiss={closeMenu} anchor={<NavBarIconButton icon={AppIcons.menu} onPress={openMenu} />}>
      <Menu.Item leadingIcon={AppIcons.favorite} title={'Favorite'} onPress={handleFavorite} />
      <Menu.Item leadingIcon={AppIcons.privateNoteEdit} title={'Add Private Note'} />
      <Divider bold={true} />
      <Menu.Item leadingIcon={AppIcons.block} title={'Block'} />
      <Menu.Item leadingIcon={AppIcons.mute} title={'Mute'} />
      <Menu.Item
        leadingIcon={AppIcons.report}
        title={'Report'}
        onPress={() => handleModal(<ReportModalView content={profile} />)}
      />
      <Divider bold={true} />
      <Menu.Item leadingIcon={AppIcons.moderator} title={'Moderate'} onPress={handleModerate} />
      <Menu.Item leadingIcon={AppIcons.twitarteam} title={'Registration'} onPress={handleRegCode} />
    </Menu>
  );
};
