import * as React from 'react';
import {ReactNode, useState} from 'react';
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
import {UserRegCodeModalView} from '../Views/Modals/UserRegCodeModalView';
import {useRootStack} from '../Navigation/Stacks/RootStackNavigator';
import {BottomTabComponents, MainStackComponents, RootStackComponents} from '../../libraries/Enums/Navigation';

interface UserProfileActionsMenuProps {
  profile: ProfilePublicData;
  isFavorite: boolean;
  isMuted: boolean;
  isBlocked: boolean;
}

export const UserProfileActionsMenu = ({profile, isFavorite, isMuted, isBlocked}: UserProfileActionsMenuProps) => {
  const [visible, setVisible] = useState(false);
  const {setModalContent, setModalVisible} = useModal();
  const muteMutation = useUserMuteMutation();
  const blockMutation = useUserBlockMutation();
  const favoriteMutation = useUserFavoriteMutation();
  const {mutes, setMutes, blocks, setBlocks, favorites, setFavorites} = useUserRelations();
  const {hasTwitarrTeam, hasModerator} = usePrivilege();
  const rootNavigation = useRootStack();

  const openMenu = () => setVisible(true);
  const closeMenu = () => setVisible(false);

  const handleModerate = () => {
    closeMenu();
    rootNavigation.push(RootStackComponents.rootContentScreen, {
      screen: BottomTabComponents.homeTab,
      params: {
        screen: MainStackComponents.siteUIScreen,
        params: {
          resource: 'userprofile',
          id: profile.header.userID,
          moderate: true,
        },
      },
    });
  };
  const handleFavorite = () => {
    if (isFavorite) {
      favoriteMutation.mutate(
        {
          userID: profile.header.userID,
          action: 'unfavorite',
        },
        {
          onSuccess: () => {
            setFavorites(favorites.filter(m => m.userID !== profile.header.userID));
            closeMenu();
          },
        },
      );
    } else {
      favoriteMutation.mutate(
        {
          userID: profile.header.userID,
          action: 'favorite',
        },
        {
          onSuccess: () => {
            setFavorites(favorites.concat([profile.header]));
            closeMenu();
          },
        },
      );
    }
  };
  const handleModal = (content: ReactNode) => {
    closeMenu();
    setModalContent(content);
    setModalVisible(true);
  };
  const handleRegCode = () => {
    closeMenu();
    setModalContent(<UserRegCodeModalView userID={profile.header.userID} />);
    setModalVisible(true);
  };
  const handleNote = () => {
    closeMenu();
    rootNavigation.push(RootStackComponents.rootContentScreen, {
      screen: BottomTabComponents.homeTab,
      params: {
        screen: MainStackComponents.userPrivateNoteScreen,
        params: {
          user: profile,
        },
      },
    });
  };

  return (
    <Menu
      visible={visible}
      onDismiss={closeMenu}
      anchor={<Item title={'Actions'} iconName={AppIcons.menu} onPress={openMenu} />}>
      <Menu.Item
        leadingIcon={isFavorite ? AppIcons.unfavorite : AppIcons.favorite}
        title={isFavorite ? 'Unfavorite' : 'Favorite'}
        onPress={handleFavorite}
      />
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
