import React from 'react';
import {Divider, Menu} from 'react-native-paper';
import {AppIcons} from '../../../libraries/Enums/Icons';
import {useModal} from '../../Context/Contexts/ModalContext';
import {ForumData} from '../../../libraries/Structs/ControllerStructs';
import {usePrivilege} from '../../Context/Contexts/PrivilegeContext';
import {Item} from 'react-navigation-header-buttons';
import {ReportModalView} from '../../Views/Modals/ReportModalView';
import {ReactNode, useCallback, useState} from 'react';
import {PostAsModeratorMenuItem} from '../Items/PostAsModeratorMenuItem';
import {PostAsTwitarrTeamMenuItem} from '../Items/PostAsTwitarrTeamMenuItem';
import {CommonStackComponents, useCommonStack} from '../../Navigation/CommonScreens';
import {FavoriteMenuItem} from '../Items/FavoriteMenuItem';
import {MuteMenuItem} from '../Items/MuteMenuItem';
import {QueryKey, useQueryClient} from '@tanstack/react-query';
import {ModerateMenuItem} from '../Items/ModerateMenuItem';
import {ReloadMenuItem} from '../Items/ReloadMenuItem';
import {useForumRelationMutation} from '../../Queries/Forum/ForumThreadRelationMutations.ts';
import {ForumThreadPinItem} from './Items/ForumThreadPinItem';
import {AppHeaderMenu} from '../AppHeaderMenu.tsx';
import {useUserProfileQuery} from '../../Queries/User/UserQueries.ts';

interface ForumThreadActionsMenuProps {
  forumData: ForumData;
  invalidationQueryKeys: QueryKey[];
  onRefresh: () => void;
}

export const ForumThreadScreenActionsMenu = ({
  forumData,
  invalidationQueryKeys,
  onRefresh,
}: ForumThreadActionsMenuProps) => {
  const [visible, setVisible] = React.useState(false);
  const {setModalContent, setModalVisible} = useModal();
  const {hasModerator, hasTwitarrTeam} = usePrivilege();
  const {data: profilePublicData} = useUserProfileQuery();
  const commonNavigation = useCommonStack();
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
          onSuccess: async () => {
            const invalidations = invalidationQueryKeys.map(key => {
              return queryClient.invalidateQueries(key);
            });
            await Promise.all(invalidations);
          },
          onSettled: () => {
            setRefreshing(false);
            closeMenu();
          },
        },
      );
    }
  }, [forumData, invalidationQueryKeys, queryClient, relationMutation]);

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
          onSuccess: async () => {
            const invalidations = invalidationQueryKeys.map(key => {
              return queryClient.invalidateQueries(key);
            });
            await Promise.all(invalidations);
          },
          onSettled: () => {
            setRefreshing(false);
            closeMenu();
          },
        },
      );
    }
  }, [forumData, invalidationQueryKeys, queryClient, relationMutation]);

  const handleHelp = () => {
    closeMenu();
    commonNavigation.push(CommonStackComponents.forumHelpScreen);
  };

  return (
    <AppHeaderMenu
      visible={visible}
      onDismiss={closeMenu}
      anchor={<Item title={'Actions'} iconName={AppIcons.menu} onPress={openMenu} />}>
      <ReloadMenuItem closeMenu={closeMenu} onReload={onRefresh} />
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
            leadingIcon={AppIcons.edit}
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
          <ForumThreadPinItem
            isPinned={forumData.isPinned}
            refreshing={refreshing}
            categoryID={forumData.categoryID}
            forumID={forumData.forumID}
            closeMenu={closeMenu}
            setRefreshing={setRefreshing}
            invalidationQueryKeys={invalidationQueryKeys}
          />
          <Divider bold={true} />
        </>
      )}
      <Menu.Item onPress={handleHelp} title={'Help'} leadingIcon={AppIcons.help} />
    </AppHeaderMenu>
  );
};
