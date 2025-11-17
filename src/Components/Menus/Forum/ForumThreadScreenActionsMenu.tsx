import {QueryKey, useQueryClient} from '@tanstack/react-query';
import React, {ReactNode, useCallback, useState} from 'react';
import {Divider, Menu} from 'react-native-paper';
import {Item} from 'react-navigation-header-buttons';

import {AppMenu} from '#src/Components/Menus/AppMenu';
import {ForumThreadPinItem} from '#src/Components/Menus/Forum/Items/ForumThreadPinItem';
import {FavoriteMenuItem} from '#src/Components/Menus/Items/FavoriteMenuItem';
import {ModerateMenuItem} from '#src/Components/Menus/Items/ModerateMenuItem';
import {MuteMenuItem} from '#src/Components/Menus/Items/MuteMenuItem';
import {PostAsModeratorMenuItem} from '#src/Components/Menus/Items/PostAsModeratorMenuItem';
import {PostAsTwitarrTeamMenuItem} from '#src/Components/Menus/Items/PostAsTwitarrTeamMenuItem';
import {ReloadMenuItem} from '#src/Components/Menus/Items/ReloadMenuItem';
import {ShareMenuItem} from '#src/Components/Menus/Items/ShareMenuItem';
import {ReportModalView} from '#src/Components/Views/Modals/ReportModalView';
import {useModal} from '#src/Context/Contexts/ModalContext';
import {usePrivilege} from '#src/Context/Contexts/PrivilegeContext';
import {AppIcons} from '#src/Enums/Icons';
import {ShareContentType} from '#src/Enums/ShareContentType';
import {useMenu} from '#src/Hooks/useMenu';
import {CommonStackComponents, useCommonStack} from '#src/Navigation/CommonScreens';
import {useForumRelationMutation} from '#src/Queries/Forum/ForumThreadRelationMutations';
import {useUserProfileQuery} from '#src/Queries/User/UserQueries';
import {ForumData} from '#src/Structs/ControllerStructs';

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
  const {visible, openMenu, closeMenu} = useMenu();
  const {setModalContent, setModalVisible} = useModal();
  const {hasModerator, hasTwitarrTeam} = usePrivilege();
  const {data: profilePublicData} = useUserProfileQuery();
  const commonNavigation = useCommonStack();
  const relationMutation = useForumRelationMutation();
  const [refreshing, setRefreshing] = useState(false);
  const queryClient = useQueryClient();

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
              return queryClient.invalidateQueries({queryKey: key});
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
  }, [forumData, invalidationQueryKeys, queryClient, relationMutation, closeMenu]);

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
              return queryClient.invalidateQueries({queryKey: key});
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
  }, [forumData, invalidationQueryKeys, queryClient, relationMutation, closeMenu]);

  const handleHelp = () => {
    closeMenu();
    commonNavigation.push(CommonStackComponents.forumHelpScreen);
  };

  return (
    <AppMenu
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
        </>
      )}
      <ShareMenuItem contentType={ShareContentType.forum} contentID={forumData.forumID} closeMenu={closeMenu} />
      <Divider bold={true} />
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
    </AppMenu>
  );
};
