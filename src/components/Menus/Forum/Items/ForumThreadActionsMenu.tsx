import React, {Dispatch, ReactNode, SetStateAction, useCallback, useState} from 'react';
import {Menu} from 'react-native-paper';
import {AppIcons} from '../../../../libraries/Enums/Icons';
import {BottomTabComponents, EventStackComponents, RootStackComponents} from '../../../../libraries/Enums/Navigation';
import {useUserData} from '../../../Context/Contexts/UserDataContext';
import {useRootStack} from '../../../Navigation/Stacks/RootStackNavigator';
import {ForumListData} from '../../../../libraries/Structs/ControllerStructs';
import {ForumListDataActions} from '../../../Reducers/Forum/ForumListDataReducer';
import {useForumRelationMutation} from '../../../Queries/Forum/ForumRelationQueries';
import {useTwitarr} from '../../../Context/Contexts/TwitarrContext';
import {usePrivilege} from '../../../Context/Contexts/PrivilegeContext';
import {StateLoadingIcon} from '../../../Icons/StateLoadingIcon';
import {useForumPinMutation} from '../../../Queries/Forum/ForumPinMutations';
import {useForumCategoryPinnedThreadsQuery} from '../../../Queries/Forum/ForumCategoryQueries';

interface ForumThreadActionsMenuProps {
  anchor: ReactNode;
  forumListData: ForumListData;
  visible: boolean;
  setVisible: Dispatch<SetStateAction<boolean>>;
  categoryID?: string;
}

export const ForumThreadActionsMenu = (props: ForumThreadActionsMenuProps) => {
  const {profilePublicData} = useUserData();
  const rootNavigation = useRootStack();
  const eventID = props.forumListData.eventID;
  const relationMutation = useForumRelationMutation();
  const {dispatchForumListData} = useTwitarr();
  const [refreshing, setRefreshing] = useState(false);
  const {hasModerator} = usePrivilege();
  const pinMutation = useForumPinMutation();
  const {refetch: refetchPins} = useForumCategoryPinnedThreadsQuery(props.categoryID ?? '');

  const closeMenu = useCallback(() => props.setVisible(false), [props]);

  const handleFavorite = useCallback(() => {
    setRefreshing(true);
    relationMutation.mutate(
      {
        forumID: props.forumListData.forumID,
        relationType: 'favorite',
        action: props.forumListData.isFavorite ? 'delete' : 'create',
      },
      {
        onSuccess: () => {
          dispatchForumListData({
            type: ForumListDataActions.updateRelations,
            forumID: props.forumListData.forumID,
            isMuted: props.forumListData.isMuted,
            isFavorite: !props.forumListData.isFavorite,
          });
        },
        onSettled: () => {
          setRefreshing(false);
          closeMenu();
        },
      },
    );
  }, [
    closeMenu,
    dispatchForumListData,
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
        onSuccess: () => {
          dispatchForumListData({
            type: ForumListDataActions.updateRelations,
            forumID: props.forumListData.forumID,
            isMuted: !props.forumListData.isMuted,
            isFavorite: props.forumListData.isFavorite,
          });
        },
        onSettled: () => {
          setRefreshing(false);
          closeMenu();
        },
      },
    );
  }, [
    closeMenu,
    dispatchForumListData,
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
        onSuccess: () => {
          dispatchForumListData({
            type: ForumListDataActions.updateThread,
            newThread: {
              ...props.forumListData,
              isPinned: !props.forumListData.isPinned,
            },
          });
          refetchPins();
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
            rootNavigation.push(RootStackComponents.rootContentScreen, {
              screen: BottomTabComponents.scheduleTab,
              params: {
                screen: EventStackComponents.eventScreen,
                initial: false,
                params: {
                  eventID: eventID,
                },
              },
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
