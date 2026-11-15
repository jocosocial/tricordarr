import React, {PropsWithChildren, useCallback, useMemo} from 'react';
import {StyleSheet} from 'react-native';
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

/**
 * Swipe actions for a forum thread row: Event/Pin on the left, Mute/Favorite/Read on the right.
 * Favorite and Mute each get their own mutation instance so one can't overwrite the other's
 * in-flight state. The pending flags are derived from the mutation's variables rather than local
 * state, so a recycled cell showing a different thread never inherits another thread's spinner.
 */
export const ForumThreadListItemSwipeable = (props: ForumThreadListItemSwipeableProps) => {
  const {theme} = useAppTheme();
  const favoriteMutation = useForumRelationMutation();
  const muteMutation = useForumRelationMutation();
  const commonNavigation = useCommonStack();
  const {forumID, eventID, isFavorite, isMuted, isPinned} = props.forumListData;
  const {categoryID} = props;
  const {hasModerator} = usePrivilege();
  const pinMutation = useForumPinMutation();
  const markReadMutation = useForumMarkReadMutation();
  const {markRead} = useForumCacheReducer();

  const favoriteRefreshing = favoriteMutation.isPending && favoriteMutation.variables?.forumID === forumID;
  const muteRefreshing = muteMutation.isPending && muteMutation.variables?.forumID === forumID;
  const readRefreshing = markReadMutation.isPending && markReadMutation.variables?.forumID === forumID;
  const pinRefreshing = pinMutation.isPending && pinMutation.variables?.forumID === forumID;
  const relationRefreshing = favoriteRefreshing || muteRefreshing;

  const styles = useMemo(
    () =>
      StyleSheet.create({
        event: {backgroundColor: theme.colors.twitarrNeutralButton},
        eventText: {color: theme.colors.onTwitarrNeutralButton},
        pin: {backgroundColor: theme.colors.elevation.level1},
        mute: {backgroundColor: theme.colors.elevation.level2},
        favorite: {backgroundColor: theme.colors.elevation.level1},
        read: {backgroundColor: theme.colors.elevation.level3},
      }),
    [theme],
  );

  /**
   * Mark the thread read. Applied eagerly with no rollback: markRead collapses readCount toward
   * postCount and can't be un-applied without capturing the prior counts. A failed request
   * self-heals on the next refetch. Closes up front so the row is already shut when it re-renders.
   */
  const handleMarkAsRead = useCallback(
    (swipeable: SwipeableMethods) => {
      swipeable.close();
      markRead(forumID, categoryID);
      markReadMutation.mutate({forumID});
    },
    [markRead, markReadMutation, forumID, categoryID],
  );

  /** Toggle favorite. The mutation hook handles the optimistic cache update and rollback. */
  const handleFavorite = useCallback(
    (swipeable: SwipeableMethods) => {
      favoriteMutation.mutate(
        {
          forumID,
          categoryID,
          relationType: 'favorite',
          action: isFavorite ? 'delete' : 'create',
        },
        {onSettled: () => swipeable.close()},
      );
    },
    [favoriteMutation, forumID, categoryID, isFavorite],
  );

  /** Toggle mute. The mutation hook handles the optimistic cache update and rollback. */
  const handleMute = useCallback(
    (swipeable: SwipeableMethods) => {
      muteMutation.mutate(
        {
          forumID,
          categoryID,
          relationType: 'mute',
          action: isMuted ? 'delete' : 'create',
        },
        {onSettled: () => swipeable.close()},
      );
    },
    [muteMutation, forumID, categoryID, isMuted],
  );

  /** Moderator pin toggle. The mutation hook handles the optimistic cache update and rollback. */
  const handlePin = useCallback(
    (swipeable: SwipeableMethods) => {
      if (!categoryID) {
        return;
      }
      pinMutation.mutate(
        {
          forumID,
          categoryID,
          action: isPinned ? 'unpin' : 'pin',
        },
        {onSettled: () => swipeable.close()},
      );
    },
    [pinMutation, forumID, categoryID, isPinned],
  );

  /** Open the event this thread belongs to, then close the swipeable. */
  const handleEvent = useCallback(
    (swipeable: SwipeableMethods) => {
      if (!eventID) {
        return;
      }
      swipeable.close();
      commonNavigation.push(CommonStackComponents.eventScreen, {eventID});
    },
    [commonNavigation, eventID],
  );

  const showPin = hasModerator && !!categoryID;

  /** Event (when the thread belongs to one) and Pin (moderators, inside a category). */
  const renderLeftPanel = useCallback(
    (
      _progressAnimatedValue: SharedValue<number>,
      _dragAnimatedValue: SharedValue<number>,
      swipeable: SwipeableMethods,
    ) => (
      <>
        {eventID && (
          <SwipeableButton
            testID={'forumThreadEvent-button'}
            text={'Event'}
            iconName={AppIcons.events}
            onPress={() => handleEvent(swipeable)}
            style={styles.event}
            textStyle={styles.eventText}
            iconColor={theme.colors.onTwitarrNeutralButton}
          />
        )}
        {showPin && (
          <SwipeableButton
            testID={'forumThreadPin-button'}
            text={isPinned ? 'Unpin' : 'Pin'}
            refreshing={pinRefreshing}
            disabled={pinRefreshing}
            onPress={() => handlePin(swipeable)}
            iconName={AppIcons.moderator}
            style={styles.pin}
          />
        )}
      </>
    ),
    [eventID, showPin, isPinned, pinRefreshing, styles, theme, handleEvent, handlePin],
  );

  /** Mute, Favorite, Read. Mute and Favorite are mutually exclusive on the server. */
  const renderRightPanel = useCallback(
    (
      _progressAnimatedValue: SharedValue<number>,
      _dragAnimatedValue: SharedValue<number>,
      swipeable: SwipeableMethods,
    ) => (
      <>
        <SwipeableButton
          testID={'forumThreadMute-button'}
          text={isMuted ? 'Unmute' : 'Mute'}
          iconName={isMuted ? AppIcons.unmute : AppIcons.mute}
          style={styles.mute}
          onPress={() => handleMute(swipeable)}
          refreshing={muteRefreshing}
          disabled={isFavorite || relationRefreshing}
        />
        <SwipeableButton
          testID={'forumThreadFavorite-button'}
          text={isFavorite ? 'Unfavorite' : 'Favorite'}
          iconName={isFavorite ? AppIcons.unfavorite : AppIcons.favorite}
          onPress={() => handleFavorite(swipeable)}
          refreshing={favoriteRefreshing}
          style={styles.favorite}
          disabled={isMuted || relationRefreshing}
        />
        <SwipeableButton
          testID={'forumThreadRead-button'}
          text={'Read'}
          iconName={AppIcons.markAsRead}
          onPress={() => handleMarkAsRead(swipeable)}
          refreshing={readRefreshing}
          disabled={readRefreshing}
          style={styles.read}
        />
      </>
    ),
    [
      isMuted,
      isFavorite,
      muteRefreshing,
      favoriteRefreshing,
      relationRefreshing,
      readRefreshing,
      styles,
      handleMute,
      handleFavorite,
      handleMarkAsRead,
    ],
  );

  return (
    <BaseSwipeable
      key={forumID}
      enabled={props.enabled}
      renderLeftPanel={eventID || showPin ? renderLeftPanel : undefined}
      renderRightPanel={renderRightPanel}>
      {props.children}
    </BaseSwipeable>
  );
};
