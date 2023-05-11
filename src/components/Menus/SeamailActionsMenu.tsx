import * as React from 'react';
import {Divider, Menu} from 'react-native-paper';
import {NavBarIconButton} from '../Buttons/IconButtons/NavBarIconButton';
import {SeamailStackScreenComponents} from '../../libraries/Enums/Navigation';
import {AppIcons} from '../../libraries/Enums/Icons';
import {HelpModalView} from '../Views/Modals/HelpModalView';
import {useModal} from '../Context/Contexts/ModalContext';
import {FezData} from '../../libraries/Structs/ControllerStructs';
import {useSeamailStack} from '../Navigation/Stacks/SeamailStack';
import {usePrivilege} from '../Context/Contexts/PrivilegeContext';
import {useUserData} from '../Context/Contexts/UserDataContext';
import {useEffect, useState} from 'react';

interface SeamailActionsMenuProps {
  fez: FezData;
}

const helpContent = [
  'You can long press on a message for additional actions.',
  'Press the title to easily access details.',
];

export const SeamailActionsMenu = ({fez}: SeamailActionsMenuProps) => {
  const [visible, setVisible] = React.useState(false);
  const navigation = useSeamailStack();
  const {setModalContent, setModalVisible} = useModal();
  const {
    hasModerator,
    hasTwitarrTeam,
    setAsModerator,
    setAsTwitarrTeam,
    asModerator,
    asTwitarrTeam,
  } = usePrivilege();
  const {profilePublicData} = useUserData();

  const openMenu = () => setVisible(true);
  const closeMenu = () => setVisible(false);

  const postAsModerator = () => {
    setAsTwitarrTeam(false);
    setAsModerator(!asModerator);
    closeMenu();
  };

  const postAsTwitarrTeam = () => {
    setAsModerator(false);
    setAsTwitarrTeam(!asTwitarrTeam);
    closeMenu();
  };

  const postAsSelf = () => {
    setAsModerator(false);
    setAsTwitarrTeam(false);
    closeMenu();
  };

  const detailsAction = () => {
    navigation.push(SeamailStackScreenComponents.seamailDetailsScreen, {fezID: fez.fezID});
    closeMenu();
  };

  return (
    <Menu visible={visible} onDismiss={closeMenu} anchor={<NavBarIconButton icon={AppIcons.menu} onPress={openMenu} />}>
      <Menu.Item leadingIcon={AppIcons.details} onPress={detailsAction} title={'Details'} />
      {(hasModerator || hasTwitarrTeam) && (
        <>
          <Divider bold={true} />
          {(hasModerator || hasTwitarrTeam) && (
            <Menu.Item
              leadingIcon={AppIcons.user}
              title={`Post as ${profilePublicData.header.username}`}
              onPress={postAsSelf}
            />
          )}
          {hasModerator && (
            <Menu.Item leadingIcon={AppIcons.moderator} title={'Post as Moderator'} onPress={postAsModerator} />
          )}
          {hasTwitarrTeam && (
            <Menu.Item leadingIcon={AppIcons.twitarteam} title={'Post as TwitarrTeam'} onPress={postAsTwitarrTeam} />
          )}
          <Divider bold={true} />
        </>
      )}
      <Menu.Item
        leadingIcon={AppIcons.help}
        title={'Help'}
        onPress={() => {
          closeMenu();
          setModalContent(<HelpModalView text={helpContent} />);
          setModalVisible(true);
        }}
      />
    </Menu>
  );
};
