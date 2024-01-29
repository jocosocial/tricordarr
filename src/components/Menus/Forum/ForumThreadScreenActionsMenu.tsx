import * as React from 'react';
import {Divider, Menu} from 'react-native-paper';
import {AppIcons} from '../../../libraries/Enums/Icons';
import {useModal} from '../../Context/Contexts/ModalContext';
import {ForumData} from '../../../libraries/Structs/ControllerStructs';
import {usePrivilege} from '../../Context/Contexts/PrivilegeContext';
import {useUserData} from '../../Context/Contexts/UserDataContext';
import {Item} from 'react-navigation-header-buttons';
import {ReportModalView} from '../../Views/Modals/ReportModalView';
import {ReactNode, useCallback, useState} from 'react';
import {PostAsModeratorMenuItem} from '../Items/PostAsModeratorMenuItem';
import {PostAsTwitarrTeamMenuItem} from '../Items/PostAsTwitarrTeamMenuItem';
import {CommonStackComponents, useCommonStack} from '../../Navigation/CommonScreens';
import {ForumListDataActions} from '../../Reducers/Forum/ForumListDataReducer';
import {useTwitarr} from '../../Context/Contexts/TwitarrContext';
import {useForumRelationMutation} from '../../Queries/Forum/ForumRelationQueries';
import {FavoriteMenuItem} from '../Items/FavoriteMenuItem';
import {MuteMenuItem} from '../Items/MuteMenuItem';
import {QueryKey, useQueryClient} from '@tanstack/react-query';
import {ModerateMenuItem} from '../Items/ModerateMenuItem';
import {HelpMenuItem} from '../Items/HelpMenuItem';

interface ForumThreadActionsMenuProps {
  forumData: ForumData;
  invalidationQueryKey: QueryKey;
}

const helpContent = [
  'Long press on a post to favorite, edit, or add a reaction.',
  'Moderators or the forum creator can pin posts to the forum.',
];

export const ForumThreadScreenActionsMenu = ({forumData, invalidationQueryKey}: ForumThreadActionsMenuProps) => {
  const [visible, setVisible] = React.useState(false);
  const {setModalContent, setModalVisible} = useModal();
  const {hasModerator, hasTwitarrTeam} = usePrivilege();
  const {profilePublicData} = useUserData();
  const commonNavigation = useCommonStack();
  const {dispatchForumListData} = useTwitarr();
  const relationMutation = useForumRelationMutation();
  const [refreshing, setRefreshing] = useState(false);
  const queryClient = useQueryClient();

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
            queryClient.invalidateQueries(invalidationQueryKey);
            dispatchForumListData({
              type: ForumListDataActions.updateRelations,
              forumID: forumData.forumID,
              isMuted: forumData.isMuted,
              isFavorite: !forumData.isFavorite,
            });
          },
          onSettled: () => {
            setRefreshing(false);
            closeMenu();
          },
        },
      );
    }
  }, [dispatchForumListData, forumData, invalidationQueryKey, queryClient, relationMutation]);

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
            queryClient.invalidateQueries(invalidationQueryKey);
            dispatchForumListData({
              type: ForumListDataActions.updateRelations,
              forumID: forumData.forumID,
              isMuted: !forumData.isMuted,
              isFavorite: forumData.isFavorite,
            });
          },
          onSettled: () => {
            setRefreshing(false);
            closeMenu();
          },
        },
      );
    }
  }, [dispatchForumListData, forumData, invalidationQueryKey, queryClient, relationMutation]);

  return (
    <Menu
      visible={visible}
      onDismiss={closeMenu}
      anchor={<Item title={'Actions'} iconName={AppIcons.menu} onPress={openMenu} />}>
      <Menu.Item
        title={'Pinned Posts'}
        leadingIcon={AppIcons.pin}
        onPress={() => {
          closeMenu();
          commonNavigation.push(CommonStackComponents.forumPostPinnedScreen, {
            forumID: forumData.forumID,
          });
        }}
      />
      <Divider bold={true} />
      <FavoriteMenuItem
        onPress={handleFavorite}
        disabled={forumData.isMuted}
        isFavorite={forumData.isFavorite}
        refreshing={refreshing}
      />
      {forumData.creator.userID !== profilePublicData?.header.userID && (
        <MuteMenuItem
          onPress={handleMute}
          disabled={forumData.isFavorite}
          isMuted={forumData.isMuted}
          refreshing={refreshing}
        />
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
          <ModerateMenuItem
            closeMenu={closeMenu}
            resourceID={forumData.forumID}
            resource={'forum'}
            navigation={commonNavigation}
          />
          <Divider bold={true} />
        </>
      )}
      <HelpMenuItem helpContent={helpContent} closeMenu={closeMenu} />
    </Menu>
  );
};
