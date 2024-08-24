import * as React from 'react';
import {ReactNode, useCallback, useState} from 'react';
import {Divider, Menu} from 'react-native-paper';
import {ProfilePublicData} from '../../libraries/Structs/ControllerStructs';
import {AppIcons} from '../../libraries/Enums/Icons';
import {ReportModalView} from '../Views/Modals/ReportModalView';
import {useModal} from '../Context/Contexts/ModalContext';
import {MuteUserModalView} from '../Views/Modals/MuteUserModalView';
import {useUserMuteMutation} from '../Queries/Users/UserMuteQueries';
import {useUserRelations} from '../Context/Contexts/UserRelationsContext';
import {useUserBlockMutation} from '../Queries/Users/UserBlockQueries';
import {BlockUserModalView} from '../Views/Modals/BlockUserModalView';
import {useUserFavoriteMutation} from '../Queries/Users/UserFavoriteQueries';
import {usePrivilege} from '../Context/Contexts/PrivilegeContext';
import {Item} from 'react-navigation-header-buttons';
import {CommonStackComponents, useCommonStack} from '../Navigation/CommonScreens';

interface UserProfileActionsMenuProps {
  profile: ProfilePublicData;
  isMuted: boolean;
  isBlocked: boolean;
}

export const UserProfileActionsMenu = ({profile, isMuted, isBlocked}: UserProfileActionsMenuProps) => {
  const [visible, setVisible] = useState(false);
  const {setModalContent, setModalVisible} = useModal();
  const muteMutation = useUserMuteMutation();
  const blockMutation = useUserBlockMutation();
  const {mutes, setMutes, blocks, setBlocks, favorites, setFavorites} = useUserRelations();
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

  return (
    <Menu
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
    </Menu>
  );
};
