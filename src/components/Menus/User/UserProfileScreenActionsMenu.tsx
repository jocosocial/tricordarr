import * as React from 'react';
import {ReactNode, useState} from 'react';
import {Divider, Menu} from 'react-native-paper';
import {ProfilePublicData} from '../../../libraries/Structs/ControllerStructs.tsx';
import {AppIcons} from '../../../libraries/Enums/Icons.ts';
import {ReportModalView} from '../../Views/Modals/ReportModalView.tsx';
import {useModal} from '../../Context/Contexts/ModalContext.ts';
import {MuteUserModalView} from '../../Views/Modals/MuteUserModalView.tsx';
import {useUserRelations} from '../../Context/Contexts/UserRelationsContext.ts';
import {BlockUserModalView} from '../../Views/Modals/BlockUserModalView.tsx';
import {usePrivilege} from '../../Context/Contexts/PrivilegeContext.ts';
import {Item} from 'react-navigation-header-buttons';
import {CommonStackComponents, useCommonStack} from '../../Navigation/CommonScreens.tsx';
import {useUserBlockMutation} from '../../Queries/Users/UserBlockMutations.ts';
import {useUserMuteMutation} from '../../Queries/Users/UserMuteMutations.ts';
import {AppHeaderMenu} from '../AppHeaderMenu.tsx';

interface UserProfileActionsMenuProps {
  profile: ProfilePublicData;
  isMuted: boolean;
  isBlocked: boolean;
  oobe?: boolean;
}

export const UserProfileScreenActionsMenu = ({profile, isMuted, isBlocked, oobe}: UserProfileActionsMenuProps) => {
  const [visible, setVisible] = useState(false);
  const {setModalContent, setModalVisible} = useModal();
  const muteMutation = useUserMuteMutation();
  const blockMutation = useUserBlockMutation();
  const {mutes, setMutes, blocks, setBlocks} = useUserRelations();
  const {hasTwitarrTeam, hasModerator} = usePrivilege();
  const commonNavigation = useCommonStack();

  const openMenu = () => setVisible(true);
  const closeMenu = () => setVisible(false);

  const handleModerate = () => {
    closeMenu();
    commonNavigation.push(CommonStackComponents.siteUIScreen, {
      resource: 'userprofile',
      id: profile.header.userID,
      moderate: true,
    });
  };
  const handleModal = (content: ReactNode) => {
    closeMenu();
    setModalContent(content);
    setModalVisible(true);
  };
  const handleRegCode = () => {
    closeMenu();
    commonNavigation.push(CommonStackComponents.userRegCodeScreen, {
      userID: profile.header.userID,
    });
  };
  const handleNote = () => {
    closeMenu();
    commonNavigation.push(CommonStackComponents.userPrivateNoteScreen, {
      user: profile,
    });
  };
  const handleHelp = () => {
    closeMenu();
    commonNavigation.push(CommonStackComponents.userProfileHelpScreen, {
      oobe: oobe,
    });
  };

  return (
    <AppHeaderMenu
      visible={visible}
      onDismiss={closeMenu}
      anchor={<Item title={'Actions'} iconName={AppIcons.menu} onPress={openMenu} />}>
      <Menu.Item leadingIcon={AppIcons.privateNoteEdit} title={'Private Note'} onPress={handleNote} />
      <Divider bold={true} />
      <Menu.Item
        leadingIcon={isBlocked ? AppIcons.unblock : AppIcons.block}
        title={isBlocked ? 'Unblock' : 'Block'}
        onPress={() => {
          if (isBlocked) {
            blockMutation.mutate(
              {userID: profile.header.userID, action: 'unblock'},
              {
                onSuccess: () => {
                  setBlocks(blocks.filter(m => m.userID !== profile.header.userID));
                  closeMenu();
                },
              },
            );
          } else {
            handleModal(<BlockUserModalView user={profile.header} />);
          }
        }}
      />
      <Menu.Item
        leadingIcon={isMuted ? AppIcons.unmute : AppIcons.mute}
        title={isMuted ? 'Unmute' : 'Mute'}
        onPress={() => {
          if (isMuted) {
            muteMutation.mutate(
              {userID: profile.header.userID, action: 'unmute'},
              {
                onSuccess: () => {
                  setMutes(mutes.filter(m => m.userID !== profile.header.userID));
                  closeMenu();
                },
              },
            );
          } else {
            handleModal(<MuteUserModalView user={profile.header} />);
          }
        }}
      />
      <Menu.Item
        leadingIcon={AppIcons.report}
        title={'Report'}
        onPress={() => handleModal(<ReportModalView profile={profile} />)}
      />
      {(hasModerator || hasTwitarrTeam) && (
        <>
          <Divider bold={true} />
          {hasModerator && <Menu.Item leadingIcon={AppIcons.moderator} title={'Moderate'} onPress={handleModerate} />}
          {hasTwitarrTeam && (
            <Menu.Item leadingIcon={AppIcons.twitarteam} title={'Registration'} onPress={handleRegCode} />
          )}
        </>
      )}
      <Divider bold={true} />
      <Menu.Item leadingIcon={AppIcons.help} title={'Help'} onPress={handleHelp} />
    </AppHeaderMenu>
  );
};
