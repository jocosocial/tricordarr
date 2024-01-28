import * as React from 'react';
import {Divider, Menu} from 'react-native-paper';
import {AppIcons} from '../../../libraries/Enums/Icons';
import {HelpModalView} from '../../Views/Modals/HelpModalView';
import {useModal} from '../../Context/Contexts/ModalContext';
import {ForumData} from '../../../libraries/Structs/ControllerStructs';
import {usePrivilege} from '../../Context/Contexts/PrivilegeContext';
import {useUserData} from '../../Context/Contexts/UserDataContext';
import {Item} from 'react-navigation-header-buttons';
import {ReportModalView} from '../../Views/Modals/ReportModalView';
import {Dispatch, ReactNode, SetStateAction, useCallback} from 'react';
import {PostAsModeratorMenuItem} from '../Items/PostAsModeratorMenuItem';
import {PostAsTwitarrTeamMenuItem} from '../Items/PostAsTwitarrTeamMenuItem';
import {CommonStackComponents, useCommonStack} from '../../Navigation/CommonScreens';
import {useAppTheme} from '../../../styles/Theme';
import {ForumListDataActions} from '../../Reducers/Forum/ForumListDataReducer';
import {useTwitarr} from '../../Context/Contexts/TwitarrContext';
import {useForumRelationMutation} from '../../Queries/Forum/ForumRelationQueries';

interface ForumThreadActionsMenuProps {
  forumData: ForumData;
  setForumData: Dispatch<SetStateAction<ForumData | undefined>>;
  setRefreshing: Dispatch<SetStateAction<boolean>>;
}

const helpContent = [
  'Long press on a post to favorite, edit, or add a reaction.',
  'Moderators or the forum creator can pin posts to the forum.',
];

export const ForumThreadScreenActionsMenu = ({forumData, setForumData, setRefreshing}: ForumThreadActionsMenuProps) => {
  const [visible, setVisible] = React.useState(false);
  const {setModalContent, setModalVisible} = useModal();
  const {hasModerator, hasTwitarrTeam} = usePrivilege();
  const {profilePublicData} = useUserData();
  const commonNavigation = useCommonStack();
  const theme = useAppTheme();
  const {dispatchForumListData} = useTwitarr();
  const relationMutation = useForumRelationMutation();

  const openMenu = () => setVisible(true);
  const closeMenu = () => setVisible(false);

  const handleModal = (content: ReactNode) => {
    closeMenu();
    setModalContent(content);
    setModalVisible(true);
  };

  const handleFavorite = useCallback(() => {
    if (forumData) {
      setRefreshing(true);
      relationMutation.mutate(
        {
          forumID: forumData.forumID,
          relationType: 'favorite',
          action: forumData.isFavorite ? 'delete' : 'create',
        },
        {
          onSuccess: () => {
            setForumData({
              ...forumData,
              isFavorite: !forumData.isFavorite,
            });
            dispatchForumListData({
              type: ForumListDataActions.updateRelations,
              forumID: forumData.forumID,
              isMuted: forumData.isMuted,
              isFavorite: !forumData.isFavorite,
            });
          },
          onSettled: () => setRefreshing(false),
        },
      );
    }
  }, [dispatchForumListData, forumData, relationMutation, setForumData, setRefreshing]);

  const handleMute = useCallback(() => {
    if (forumData) {
      setRefreshing(true);
      relationMutation.mutate(
        {
          forumID: forumData.forumID,
          relationType: 'mute',
          action: forumData.isMuted ? 'delete' : 'create',
        },
        {
          onSuccess: () => {
            setForumData({
              ...forumData,
              isMuted: !forumData.isMuted,
            });
            dispatchForumListData({
              type: ForumListDataActions.updateRelations,
              forumID: forumData.forumID,
              isMuted: !forumData.isMuted,
              isFavorite: forumData.isFavorite,
            });
          },
          onSettled: () => setRefreshing(false),
        },
      );
    }
  }, [dispatchForumListData, forumData, relationMutation, setForumData, setRefreshing]);

  return (
    <Menu
      visible={visible}
      onDismiss={closeMenu}
      anchor={<Item title={'Actions'} iconName={AppIcons.menu} onPress={openMenu} />}>
      <Menu.Item
        title={'Pinned Posts'}
        leadingIcon={AppIcons.pin}
        onPress={() =>
          commonNavigation.push(CommonStackComponents.forumPostPinnedScreen, {
            forumID: forumData.forumID,
          })
        }
      />
      <Menu.Item
        title={'Favorite'}
        leadingIcon={AppIcons.favorite}
        onPress={handleFavorite}
        disabled={forumData.isMuted}
      />
      {forumData.creator.userID !== profilePublicData?.header.userID && (
        <Menu.Item title={'Mute'} leadingIcon={AppIcons.mute} onPress={handleMute} disabled={forumData.isFavorite} />
      )}
      {forumData.creator.userID === profilePublicData?.header.userID && (
        <>
          <Menu.Item
            dense={false}
            title={'Edit'}
            leadingIcon={AppIcons.forumEdit}
            onPress={() => {
              closeMenu();
              commonNavigation.push(CommonStackComponents.forumThreadEditScreen, {
                forumData: forumData,
              });
            }}
          />
          <Divider bold={true} />
        </>
      )}
      {forumData?.creator.username !== profilePublicData?.header.username && (
        <>
          <Menu.Item
            dense={false}
            leadingIcon={AppIcons.report}
            title={'Report'}
            onPress={() => handleModal(<ReportModalView forum={forumData} />)}
          />
          <Divider bold={true} />
        </>
      )}
      {hasTwitarrTeam && (
        <>
          <PostAsTwitarrTeamMenuItem closeMenu={closeMenu} />
          <Divider bold={true} />
        </>
      )}
      {hasModerator && (
        <>
          <PostAsModeratorMenuItem closeMenu={closeMenu} />
          <Menu.Item
            dense={false}
            leadingIcon={AppIcons.moderator}
            title={'Moderate'}
            onPress={() => {
              commonNavigation.push(CommonStackComponents.siteUIScreen, {
                resource: 'forum',
                id: forumData.forumID,
                moderate: true,
              });
              closeMenu();
            }}
          />
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
