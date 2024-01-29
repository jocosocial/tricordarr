import React, {Dispatch, ReactNode, SetStateAction, useCallback, useState} from 'react';
import {Menu} from 'react-native-paper';
import {AppIcons} from '../../../../libraries/Enums/Icons';
import {useUserData} from '../../../Context/Contexts/UserDataContext';
import {ForumListData} from '../../../../libraries/Structs/ControllerStructs';
import {useForumRelationMutation} from '../../../Queries/Forum/ForumRelationQueries';
import {usePrivilege} from '../../../Context/Contexts/PrivilegeContext';
import {StateLoadingIcon} from '../../../Icons/StateLoadingIcon';
import {useForumPinMutation} from '../../../Queries/Forum/ForumPinMutations';
import {useForumCategoryPinnedThreadsQuery} from '../../../Queries/Forum/ForumCategoryQueries';
import {CommonStackComponents, useCommonStack} from '../../../Navigation/CommonScreens';
import {useQueryClient} from '@tanstack/react-query';

interface ForumThreadActionsMenuProps {
  anchor: ReactNode;
  forumListData: ForumListData;
  visible: boolean;
  setVisible: Dispatch<SetStateAction<boolean>>;
  categoryID?: string;
}

export const ForumThreadActionsMenu = (props: ForumThreadActionsMenuProps) => {
  const {profilePublicData} = useUserData();
  const commonNavigation = useCommonStack();
  const eventID = props.forumListData.eventID;
  const relationMutation = useForumRelationMutation();
  const [refreshing, setRefreshing] = useState(false);
  const {hasModerator} = usePrivilege();
  const pinMutation = useForumPinMutation();
  const {refetch: refetchPins} = useForumCategoryPinnedThreadsQuery(props.categoryID ?? '', {
    enabled: !!props.categoryID,
  });
  const queryClient = useQueryClient();

  const closeMenu = useCallback(() => props.setVisible(false), [props]);
  let invalidationQueryKeys = [[`/forum/${props.forumListData.forumID}`], ['/forum/search']];
  if (props.categoryID) {
    invalidationQueryKeys.push([`/forum/categories/${props.categoryID}`]);
  }

  const handleFavorite = useCallback(() => {
    setRefreshing(true);
    relationMutation.mutate(
      {
        forumID: props.forumListData.forumID,
        relationType: 'favorite',
        action: props.forumListData.isFavorite ? 'delete' : 'create',
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
  }, [
    closeMenu,
    queryClient,
    props.forumListData.forumID,
    props.forumListData.isFavorite,
    props.forumListData.isMuted,
    relationMutation,
  ]);

  const handleMute = useCallback(() => {
    setRefreshing(true);
    relationMutation.mutate(
      {
        forumID: props.forumListData.forumID,
        relationType: 'mute',
        action: props.forumListData.isMuted ? 'delete' : 'create',
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
  }, [
    closeMenu,
    queryClient,
    props.forumListData.forumID,
    props.forumListData.isFavorite,
    props.forumListData.isMuted,
    relationMutation,
  ]);

  const handlePin = () => {
    pinMutation.mutate(
      {
        forumID: props.forumListData.forumID,
        action: props.forumListData.isPinned ? 'unpin' : 'pin',
      },
      {
        onSuccess: async () => {
          const invalidations = invalidationQueryKeys.map(key => {
            return queryClient.invalidateQueries(key);
          });
          await Promise.all(
            [
              invalidations,
              queryClient.invalidateQueries([`/forum/categories/${props.categoryID}/pinnedforums`]),
            ].flat(),
          );
        },
        onSettled: () => {
          setRefreshing(false);
          closeMenu();
        },
      },
    );
  };

  const getFavoriteIcon = () => (
    <StateLoadingIcon
      iconTrue={AppIcons.unfavorite}
      iconFalse={AppIcons.favorite}
      state={props.forumListData.isFavorite}
      isLoading={refreshing}
    />
  );
  const getMuteIcon = () => (
    <StateLoadingIcon
      iconTrue={AppIcons.unmute}
      iconFalse={AppIcons.mute}
      state={props.forumListData.isMuted}
      isLoading={refreshing}
    />
  );
  const getPinnedIcon = () => (
    <StateLoadingIcon
      iconTrue={AppIcons.unpin}
      iconFalse={AppIcons.pin}
      state={props.forumListData.isPinned}
      isLoading={refreshing}
    />
  );

  return (
    <Menu visible={props.visible} onDismiss={closeMenu} anchor={props.anchor}>
      {eventID && (
        <Menu.Item
          title={'Event'}
          leadingIcon={AppIcons.events}
          onPress={() => {
            closeMenu();
            commonNavigation.push(CommonStackComponents.eventScreen, {
              eventID: eventID,
            });
          }}
        />
      )}
      <Menu.Item
        title={props.forumListData.isFavorite ? 'Unfavorite' : 'Favorite'}
        leadingIcon={getFavoriteIcon}
        onPress={handleFavorite}
        disabled={props.forumListData.isMuted}
      />
      {props.forumListData.creator.userID !== profilePublicData?.header.userID && (
        <Menu.Item
          title={props.forumListData.isMuted ? 'Unmute' : 'Mute'}
          leadingIcon={getMuteIcon}
          onPress={handleMute}
          disabled={props.forumListData.isFavorite}
        />
      )}
      {hasModerator && props.categoryID && (
        <Menu.Item
          title={props.forumListData.isPinned ? 'Unpin' : 'Pin'}
          leadingIcon={getPinnedIcon}
          onPress={handlePin}
        />
      )}
    </Menu>
  );
};
