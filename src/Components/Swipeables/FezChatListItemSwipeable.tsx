import React, {PropsWithChildren, useCallback, useMemo} from 'react';
import {StyleSheet} from 'react-native';
import {SwipeableMethods} from 'react-native-gesture-handler/ReanimatedSwipeable';
import {SharedValue} from 'react-native-reanimated';

import {SwipeableButton} from '#src/Components/Buttons/SwipeableButton';
import {BaseSwipeable} from '#src/Components/Swipeables/BaseSwipeable';
import {useAppTheme} from '#src/Context/Contexts/ThemeContext';
import {FezType} from '#src/Enums/FezType';
import {AppIcons} from '#src/Enums/Icons';
import {useFezCacheReducer} from '#src/Hooks/Fez/useFezCacheReducer';
import {openFezParentScreen} from '#src/Libraries/Navigation';
import {useCommonStack} from '#src/Navigation/Stacks/Common/CommonStackComponents';
import {useFezFavoriteMutation} from '#src/Queries/Fez/FezFavoriteMutations';
import {useFezMarkReadMutation} from '#src/Queries/Fez/FezMutations';
import {useFezMuteMutation} from '#src/Queries/Fez/FezMuteMutations';
import {FezData} from '#src/Structs/ControllerStructs';

interface FezChatListItemSwipeableProps extends PropsWithChildren {
  fez: FezData;
  enabled?: boolean;
}

/**
 * Swipe actions for a chat row: LFG/Event on the left, Mute/Favorite/Read on the right. The
 * pending flags are derived from each mutation's variables rather than local state, so a recycled
 * cell showing a different chat never inherits another chat's spinner.
 */
export const FezChatListItemSwipeable = (props: FezChatListItemSwipeableProps) => {
  const {theme} = useAppTheme();
  const muteMutation = useFezMuteMutation();
  const favoriteMutation = useFezFavoriteMutation();
  const markReadMutation = useFezMarkReadMutation();
  const {markRead} = useFezCacheReducer();
  const commonNavigation = useCommonStack();
  const {fez} = props;
  const {fezID, members} = fez;
  const isLfg = FezType.isLFGType(fez.fezType);
  const isPrivateEvent = fez.fezType === FezType.privateEvent;
  const showParentScreen = isLfg || isPrivateEvent;

  const muteRefreshing = muteMutation.isPending && muteMutation.variables?.fezID === fezID;
  const favoriteRefreshing = favoriteMutation.isPending && favoriteMutation.variables?.fezID === fezID;
  const readRefreshing = markReadMutation.isPending && markReadMutation.variables?.fezID === fezID;
  const relationRefreshing = muteRefreshing || favoriteRefreshing;

  const styles = useMemo(
    () =>
      StyleSheet.create({
        parent: {backgroundColor: theme.colors.twitarrNeutralButton},
        parentText: {color: theme.colors.onTwitarrNeutralButton},
        mute: {backgroundColor: theme.colors.elevation.level2},
        favorite: {backgroundColor: theme.colors.elevation.level4},
        read: {backgroundColor: theme.colors.elevation.level3},
      }),
    [theme],
  );

  /** Toggle mute. The mutation hook handles the optimistic cache update and rollback. */
  const handleMute = useCallback(
    (swipeable: SwipeableMethods) => {
      if (!members) {
        return;
      }
      muteMutation.mutate({action: members.isMuted ? 'unmute' : 'mute', fezID}, {onSettled: () => swipeable.close()});
    },
    [muteMutation, fezID, members],
  );

  /**
   * Toggle the favorite flag on this chat. The mutation hook handles the optimistic cache update
   * and rollback. Swiftarr rejects favoriting a muted chat, hence the disabled state on the button.
   */
  const handleFavorite = useCallback(
    (swipeable: SwipeableMethods) => {
      if (!members) {
        return;
      }
      favoriteMutation.mutate(
        {action: members.isFavorite ? 'unfavorite' : 'favorite', fezID},
        {onSettled: () => swipeable.close()},
      );
    },
    [favoriteMutation, fezID, members],
  );

  /**
   * Mark the chat read. Applied eagerly with no rollback: markRead collapses readCount toward
   * postCount and can't be un-applied without capturing the prior counts. A failed request
   * self-heals on the next refetch. Closes up front so the row is already shut when it re-renders.
   */
  const handleMarkAsRead = useCallback(
    (swipeable: SwipeableMethods) => {
      swipeable.close();
      markRead(fezID);
      markReadMutation.mutate({fezID});
    },
    [markRead, markReadMutation, fezID],
  );

  /**
   * Open the LFG or private event screen associated with this chat.
   */
  const handleOpenParent = useCallback(
    (swipeable: SwipeableMethods) => {
      swipeable.close();
      openFezParentScreen(commonNavigation, fez);
    },
    [commonNavigation, fez],
  );

  /** LFG or Event, whichever parent this chat belongs to. */
  const renderLeftPanel = useCallback(
    (
      _progressAnimatedValue: SharedValue<number>,
      _dragAnimatedValue: SharedValue<number>,
      swipeable: SwipeableMethods,
    ) => (
      <SwipeableButton
        testID={isLfg ? 'fezChatLfg-button' : 'fezChatEvent-button'}
        text={isLfg ? 'LFG' : 'Event'}
        iconName={isLfg ? AppIcons.lfg : AppIcons.personalEvent}
        onPress={() => handleOpenParent(swipeable)}
        style={styles.parent}
        textStyle={styles.parentText}
        iconColor={theme.colors.onTwitarrNeutralButton}
      />
    ),
    [isLfg, styles, theme, handleOpenParent],
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
          testID={'seamailMute-button'}
          text={members?.isMuted ? 'Unmute' : 'Mute'}
          iconName={members?.isMuted ? AppIcons.unmute : AppIcons.mute}
          style={styles.mute}
          onPress={() => handleMute(swipeable)}
          refreshing={muteRefreshing}
          disabled={!!members?.isFavorite || relationRefreshing}
        />
        <SwipeableButton
          testID={'seamailFavorite-button'}
          text={members?.isFavorite ? 'Unfavorite' : 'Favorite'}
          iconName={members?.isFavorite ? AppIcons.unfavorite : AppIcons.favorite}
          style={styles.favorite}
          onPress={() => handleFavorite(swipeable)}
          refreshing={favoriteRefreshing}
          disabled={!!members?.isMuted || relationRefreshing}
        />
        <SwipeableButton
          testID={'seamailRead-button'}
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
      members?.isMuted,
      members?.isFavorite,
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
      key={fezID}
      enabled={props.enabled !== undefined ? props.enabled && !!members : !!members}
      renderLeftPanel={showParentScreen ? renderLeftPanel : undefined}
      renderRightPanel={members ? renderRightPanel : undefined}>
      {props.children}
    </BaseSwipeable>
  );
};
