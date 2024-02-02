import React, {Dispatch, ReactNode, SetStateAction, useCallback, useMemo, useState} from 'react';
import {Menu} from 'react-native-paper';
import {AppIcons} from '../../../libraries/Enums/Icons';
import {useUserData} from '../../Context/Contexts/UserDataContext';
import {ForumListData} from '../../../libraries/Structs/ControllerStructs';
import {usePrivilege} from '../../Context/Contexts/PrivilegeContext';
import {StateLoadingIcon} from '../../Icons/StateLoadingIcon';
import {CommonStackComponents, useCommonStack} from '../../Navigation/CommonScreens';
import {useQueryClient} from '@tanstack/react-query';
import {useForumRelationMutation} from '../../Queries/Forum/ForumThreadRelationMutations';
import {ForumThreadPinItem} from './Items/ForumThreadPinItem';

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
  const queryClient = useQueryClient();

  const closeMenu = useCallback(() => props.setVisible(false), [props]);
  const invalidationQueryKeys = useMemo(() => {
    let keys = [[`/forum/${props.forumListData.forumID}`], ['/forum/search']];
    if (props.categoryID) {
      keys.push([`/forum/categories/${props.categoryID}`]);
    }
    return keys;
  }, [props.categoryID, props.forumListData.forumID]);

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
    relationMutation,
    props.forumListData.forumID,
    props.forumListData.isFavorite,
    invalidationQueryKeys,
    queryClient,
    closeMenu,
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
    relationMutation,
    props.forumListData.forumID,
    props.forumListData.isMuted,
    invalidationQueryKeys,
    queryClient,
    closeMenu,
  ]);

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
        <ForumThreadPinItem
          isPinned={props.forumListData.isPinned}
          refreshing={refreshing}
          categoryID={props.categoryID}
          forumID={props.forumListData.forumID}
          closeMenu={closeMenu}
          setRefreshing={setRefreshing}
          invalidationQueryKeys={invalidationQueryKeys}
        />
      )}
    </Menu>
  );
};
