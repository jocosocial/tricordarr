import React, {PropsWithChildren, useCallback, useState} from 'react';
import {SwipeableMethods} from 'react-native-gesture-handler/ReanimatedSwipeable';
import {SharedValue} from 'react-native-reanimated';

import {SwipeableButton} from '#src/Components/Buttons/SwipeableButton';
import {BaseSwipeable} from '#src/Components/Swipeables/BaseSwipeable';
import {usePrivilege} from '#src/Context/Contexts/PrivilegeContext';
import {useAppTheme} from '#src/Context/Contexts/ThemeContext';
import {AppIcons} from '#src/Enums/Icons';
import {useForumCacheReducer} from '#src/Hooks/Forum/useForumCacheReducer';
import {CommonStackComponents, useCommonStack} from '#src/Navigation/CommonScreens';
import {useForumMarkReadMutation} from '#src/Queries/Forum/ForumThreadMutationQueries';
import {useForumPinMutation} from '#src/Queries/Forum/ForumThreadPinMutations';
import {useForumRelationMutation} from '#src/Queries/Forum/ForumThreadRelationMutations';
import {ForumListData} from '#src/Structs/ControllerStructs';

interface ForumThreadListItemSwipeableProps extends PropsWithChildren {
  forumListData: ForumListData;
  categoryID?: string;
  enabled?: boolean;
}

export const ForumThreadListItemSwipeable = (props: ForumThreadListItemSwipeableProps) => {
  const {theme} = useAppTheme();
  const relationMutation = useForumRelationMutation();
  const [muteRefreshing, setMuteRefreshing] = useState(false);
  const [favoriteRefreshing, setFavoriteRefreshing] = useState(false);
  const [readRefreshing, setReadRefreshing] = useState(false);
  const [pinRefreshing, setPinRefreshing] = useState(false);
  const commonNavigation = useCommonStack();
  const eventID = props.forumListData.eventID;
  const {hasModerator} = usePrivilege();
  const pinMutation = useForumPinMutation();
  const markReadMutation = useForumMarkReadMutation();
  const {markRead, updateFavorite, updateMute, updatePinned} = useForumCacheReducer();

  const handleMarkAsRead = useCallback(
    async (swipeable: SwipeableMethods) => {
      swipeable.reset();
      setReadRefreshing(true);
      markReadMutation.mutate(
        {
          forumID: props.forumListData.forumID,
        },
        {
          onSuccess: () => {
            markRead(props.forumListData.forumID, props.categoryID);
          },
          onSettled: () => {
            setReadRefreshing(false);
            swipeable.reset();
          },
        },
      );
    },
    [markRead, markReadMutation, props.forumListData.forumID, props.categoryID],
  );

  const handleFavorite = useCallback(
    (swipeable: SwipeableMethods) => {
      setFavoriteRefreshing(true);
      relationMutation.mutate(
        {
          forumID: props.forumListData.forumID,
          relationType: 'favorite',
          action: props.forumListData.isFavorite ? 'delete' : 'create',
        },
        {
          onSuccess: () => {
            updateFavorite(props.forumListData.forumID, props.categoryID, !props.forumListData.isFavorite);
          },
          onSettled: () => {
            setFavoriteRefreshing(false);
            swipeable.reset();
          },
        },
      );
    },
    [relationMutation, props.forumListData.forumID, props.forumListData.isFavorite, props.categoryID, updateFavorite],
  );

  const handleMute = useCallback(
    (swipeable: SwipeableMethods) => {
      setMuteRefreshing(true);
      relationMutation.mutate(
        {
          forumID: props.forumListData.forumID,
          relationType: 'mute',
          action: props.forumListData.isMuted ? 'delete' : 'create',
        },
        {
          onSuccess: () => {
            updateMute(props.forumListData.forumID, props.categoryID, !props.forumListData.isMuted);
          },
          onSettled: () => {
            setMuteRefreshing(false);
            swipeable.reset();
          },
        },
      );
    },
    [relationMutation, props.forumListData.forumID, props.forumListData.isMuted, props.categoryID, updateMute],
  );

  const handlePin = (swipeable: SwipeableMethods) => {
    setPinRefreshing(true);
    pinMutation.mutate(
      {
        forumID: props.forumListData.forumID,
        action: props.forumListData.isPinned ? 'unpin' : 'pin',
      },
      {
        onSuccess: () => {
          updatePinned(props.forumListData.forumID, props.categoryID, !props.forumListData.isPinned);
        },
        onSettled: () => {
          setPinRefreshing(false);
          swipeable.reset();
        },
      },
    );
  };

  const renderLeftPanel = (
    progressAnimatedValue: SharedValue<number>,
    dragAnimatedValue: SharedValue<number>,
    swipeable: SwipeableMethods,
  ) => {
    return (
      <>
        {eventID && (
          <SwipeableButton
            text={'Event'}
            iconName={AppIcons.events}
            onPress={() => {
              swipeable.reset();
              commonNavigation.push(CommonStackComponents.eventScreen, {
                eventID: eventID,
              });
            }}
            style={{backgroundColor: theme.colors.twitarrNeutralButton}}
            textStyle={{color: theme.colors.onTwitarrNeutralButton}}
            iconColor={theme.colors.onTwitarrNeutralButton}
          />
        )}
        {hasModerator && props.categoryID && (
          <SwipeableButton
            text={props.forumListData.isPinned ? 'Unpin' : 'Pin'}
            refreshing={pinRefreshing}
            onPress={() => handlePin(swipeable)}
            iconName={AppIcons.moderator}
            style={{backgroundColor: theme.colors.elevation.level1}}
          />
        )}
      </>
    );
  };

  const renderRightPanel = (
    progressAnimatedValue: SharedValue<number>,
    dragAnimatedValue: SharedValue<number>,
    swipeable: SwipeableMethods,
  ) => {
    return (
      <>
        <SwipeableButton
          text={props.forumListData.isMuted ? 'Unmute' : 'Mute'}
          iconName={props.forumListData.isMuted ? AppIcons.unmute : AppIcons.mute}
          style={{backgroundColor: theme.colors.elevation.level2}}
          onPress={() => handleMute(swipeable)}
          refreshing={muteRefreshing}
          disabled={props.forumListData.isFavorite}
        />
        <SwipeableButton
          text={props.forumListData.isFavorite ? 'Unfavorite' : 'Favorite'}
          iconName={props.forumListData.isFavorite ? AppIcons.unfavorite : AppIcons.favorite}
          onPress={() => handleFavorite(swipeable)}
          refreshing={favoriteRefreshing}
          style={{backgroundColor: theme.colors.elevation.level1}}
          disabled={props.forumListData.isMuted}
        />
        <SwipeableButton
          text={'Read'}
          iconName={AppIcons.markAsRead}
          onPress={() => handleMarkAsRead(swipeable)}
          refreshing={readRefreshing}
          style={{backgroundColor: theme.colors.elevation.level3}}
        />
      </>
    );
  };

  return (
    <BaseSwipeable
      key={props.forumListData.forumID}
      enabled={props.enabled}
      renderLeftPanel={renderLeftPanel}
      renderRightPanel={renderRightPanel}>
      {props.children}
    </BaseSwipeable>
  );
};
