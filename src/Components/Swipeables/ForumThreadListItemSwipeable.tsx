import React, {PropsWithChildren, useCallback, useState} from 'react';
import {SwipeableMethods} from 'react-native-gesture-handler/ReanimatedSwipeable';
import {SharedValue} from 'react-native-reanimated';

import {SwipeableButton} from '#src/Components/Buttons/SwipeableButton';
import {BaseSwipeable} from '#src/Components/Swipeables/BaseSwipeable';
import {usePrivilege} from '#src/Context/Contexts/PrivilegeContext';
import {useAppTheme} from '#src/Context/Contexts/ThemeContext';
import {AppIcons} from '#src/Enums/Icons';
import {useForumCacheReducer} from '#src/Hooks/Forum/useForumCacheReducer';
import {CommonStackComponents, useCommonStack} from '#src/Navigation/Stacks/Common/CommonStackComponents';
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
  const {markRead, updateFavorite, updateMute, updatePinned, invalidateForum} = useForumCacheReducer();

  const handleMarkAsRead = useCallback(
    async (swipeable: SwipeableMethods) => {
      swipeable.close();
      setReadRefreshing(true);
      // Applied eagerly with no rollback: markRead collapses readCount toward postCount and
      // can't be un-applied without capturing the prior counts. A failed request self-heals
      // on the next refetch.
      markRead(props.forumListData.forumID, props.categoryID);
      markReadMutation.mutate(
        {
          forumID: props.forumListData.forumID,
        },
        {
          onSettled: () => {
            setReadRefreshing(false);
            swipeable.close();
          },
        },
      );
    },
    [markRead, markReadMutation, props.forumListData.forumID, props.categoryID],
  );

  const handleFavorite = useCallback(
    (swipeable: SwipeableMethods) => {
      setFavoriteRefreshing(true);
      const newValue = !props.forumListData.isFavorite;
      // Optimistic: flip the cache immediately so the icon is already correct by the time the
      // spinner clears, instead of waiting on a (possibly slow) network round trip to do it.
      updateFavorite(props.forumListData.forumID, props.categoryID, newValue);
      relationMutation.mutate(
        {
          forumID: props.forumListData.forumID,
          relationType: 'favorite',
          action: newValue ? 'create' : 'delete',
        },
        {
          onError: () => {
            updateFavorite(props.forumListData.forumID, props.categoryID, !newValue);
            invalidateForum(props.forumListData.forumID, props.categoryID);
          },
          onSettled: () => {
            setFavoriteRefreshing(false);
            swipeable.close();
          },
        },
      );
    },
    [
      relationMutation,
      props.forumListData.forumID,
      props.forumListData.isFavorite,
      props.categoryID,
      updateFavorite,
      invalidateForum,
    ],
  );

  const handleMute = useCallback(
    (swipeable: SwipeableMethods) => {
      setMuteRefreshing(true);
      const newValue = !props.forumListData.isMuted;
      updateMute(props.forumListData.forumID, props.categoryID, newValue);
      relationMutation.mutate(
        {
          forumID: props.forumListData.forumID,
          relationType: 'mute',
          action: newValue ? 'create' : 'delete',
        },
        {
          onError: () => {
            updateMute(props.forumListData.forumID, props.categoryID, !newValue);
            invalidateForum(props.forumListData.forumID, props.categoryID);
          },
          onSettled: () => {
            setMuteRefreshing(false);
            swipeable.close();
          },
        },
      );
    },
    [
      relationMutation,
      props.forumListData.forumID,
      props.forumListData.isMuted,
      props.categoryID,
      updateMute,
      invalidateForum,
    ],
  );

  const handlePin = (swipeable: SwipeableMethods) => {
    setPinRefreshing(true);
    const newValue = !props.forumListData.isPinned;
    updatePinned(props.forumListData.forumID, props.categoryID, newValue);
    pinMutation.mutate(
      {
        forumID: props.forumListData.forumID,
        action: newValue ? 'pin' : 'unpin',
      },
      {
        onError: () => {
          updatePinned(props.forumListData.forumID, props.categoryID, !newValue);
          invalidateForum(props.forumListData.forumID, props.categoryID);
        },
        onSettled: () => {
          setPinRefreshing(false);
          swipeable.close();
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
            testID={'forumThreadEvent-button'}
            text={'Event'}
            iconName={AppIcons.events}
            onPress={() => {
              swipeable.close();
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
            testID={'forumThreadPin-button'}
            text={props.forumListData.isPinned ? 'Unpin' : 'Pin'}
            refreshing={pinRefreshing}
            disabled={pinRefreshing}
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
          testID={'forumThreadMute-button'}
          text={props.forumListData.isMuted ? 'Unmute' : 'Mute'}
          iconName={props.forumListData.isMuted ? AppIcons.unmute : AppIcons.mute}
          style={{backgroundColor: theme.colors.elevation.level2}}
          onPress={() => handleMute(swipeable)}
          refreshing={muteRefreshing}
          disabled={props.forumListData.isFavorite || muteRefreshing}
        />
        <SwipeableButton
          testID={'forumThreadFavorite-button'}
          text={props.forumListData.isFavorite ? 'Unfavorite' : 'Favorite'}
          iconName={props.forumListData.isFavorite ? AppIcons.unfavorite : AppIcons.favorite}
          onPress={() => handleFavorite(swipeable)}
          refreshing={favoriteRefreshing}
          style={{backgroundColor: theme.colors.elevation.level1}}
          disabled={props.forumListData.isMuted || favoriteRefreshing}
        />
        <SwipeableButton
          testID={'forumThreadRead-button'}
          text={'Read'}
          iconName={AppIcons.markAsRead}
          onPress={() => handleMarkAsRead(swipeable)}
          refreshing={readRefreshing}
          disabled={readRefreshing}
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
