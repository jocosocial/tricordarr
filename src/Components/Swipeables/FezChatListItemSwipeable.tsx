import React, {PropsWithChildren, useCallback, useState} from 'react';
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

export const FezChatListItemSwipeable = (props: FezChatListItemSwipeableProps) => {
  const {theme} = useAppTheme();
  const muteMutation = useFezMuteMutation();
  const favoriteMutation = useFezFavoriteMutation();
  const markReadMutation = useFezMarkReadMutation();
  const {updateMute, updateFavorite, markRead, invalidateFez} = useFezCacheReducer();
  const [muteRefreshing, setMuteRefreshing] = useState(false);
  const [favoriteRefreshing, setFavoriteRefreshing] = useState(false);
  const [readRefreshing, setReadRefreshing] = useState(false);
  const commonNavigation = useCommonStack();
  const isLfg = FezType.isLFGType(props.fez.fezType);
  const isPrivateEvent = props.fez.fezType === FezType.privateEvent;
  const showParentScreen = isLfg || isPrivateEvent;

  const handleMute = useCallback(
    (swipeable: SwipeableMethods) => {
      if (!props.fez.members) {
        return;
      }
      const newMuted = !props.fez.members.isMuted;
      updateMute(props.fez.fezID, newMuted);
      setMuteRefreshing(true);
      const action = props.fez.members.isMuted ? 'unmute' : 'mute';
      muteMutation.mutate(
        {
          action: action,
          fezID: props.fez.fezID,
        },
        {
          onError: () => {
            updateMute(props.fez.fezID, !newMuted);
            invalidateFez(props.fez.fezID);
          },
          onSettled: () => {
            setMuteRefreshing(false);
            swipeable.reset();
          },
        },
      );
    },
    [muteMutation, props.fez.fezID, props.fez.members, updateMute, invalidateFez],
  );

  /**
   * Toggle the favorite flag on this chat. Optimistic: flip the cache before the request, roll
   * back and invalidate on failure. Swiftarr rejects favoriting a muted chat, hence the disabled
   * state on the button.
   */
  const handleFavorite = useCallback(
    (swipeable: SwipeableMethods) => {
      if (!props.fez.members) {
        return;
      }
      const newFavorite = !props.fez.members.isFavorite;
      updateFavorite(props.fez.fezID, newFavorite);
      setFavoriteRefreshing(true);
      favoriteMutation.mutate(
        {
          action: newFavorite ? 'favorite' : 'unfavorite',
          fezID: props.fez.fezID,
        },
        {
          onError: () => {
            updateFavorite(props.fez.fezID, !newFavorite);
            invalidateFez(props.fez.fezID);
          },
          onSettled: () => {
            setFavoriteRefreshing(false);
            swipeable.reset();
          },
        },
      );
    },
    [favoriteMutation, props.fez.fezID, props.fez.members, updateFavorite, invalidateFez],
  );

  const handleMarkAsRead = useCallback(
    (swipeable: SwipeableMethods) => {
      swipeable.reset();
      setReadRefreshing(true);
      // Applied eagerly with no rollback: markRead collapses readCount toward postCount and
      // can't be un-applied without capturing the prior counts. A failed request self-heals
      // on the next refetch.
      markRead(props.fez.fezID);
      markReadMutation.mutate(
        {
          fezID: props.fez.fezID,
        },
        {
          onSettled: () => {
            setReadRefreshing(false);
            swipeable.reset();
          },
        },
      );
    },
    [markRead, markReadMutation, props.fez.fezID],
  );

  /**
   * Open the LFG or private event screen associated with this chat.
   */
  const handleOpenParent = useCallback(
    (swipeable: SwipeableMethods) => {
      swipeable.reset();
      openFezParentScreen(commonNavigation, props.fez);
    },
    [commonNavigation, props.fez],
  );

  const renderLeftPanel = (
    progressAnimatedValue: SharedValue<number>,
    dragAnimatedValue: SharedValue<number>,
    swipeable: SwipeableMethods,
  ) => {
    return (
      <SwipeableButton
        testID={isLfg ? 'fezChatLfg-button' : 'fezChatEvent-button'}
        text={isLfg ? 'LFG' : 'Event'}
        iconName={isLfg ? AppIcons.lfg : AppIcons.personalEvent}
        onPress={() => handleOpenParent(swipeable)}
        style={{backgroundColor: theme.colors.twitarrNeutralButton}}
        textStyle={{color: theme.colors.onTwitarrNeutralButton}}
        iconColor={theme.colors.onTwitarrNeutralButton}
      />
    );
  };

  const renderRightPanel = (
    progressAnimatedValue: SharedValue<number>,
    dragAnimatedValue: SharedValue<number>,
    swipeable: SwipeableMethods,
  ) => {
    if (!props.fez.members) {
      return null;
    }

    return (
      <>
        <SwipeableButton
          testID={'seamailMute-button'}
          text={props.fez.members?.isMuted ? 'Unmute' : 'Mute'}
          iconName={props.fez.members?.isMuted ? AppIcons.unmute : AppIcons.mute}
          style={{backgroundColor: theme.colors.elevation.level2}}
          onPress={() => handleMute(swipeable)}
          refreshing={muteRefreshing}
          disabled={!!props.fez.members?.isFavorite || muteRefreshing}
        />
        <SwipeableButton
          testID={'seamailFavorite-button'}
          text={props.fez.members?.isFavorite ? 'Unfavorite' : 'Favorite'}
          iconName={props.fez.members?.isFavorite ? AppIcons.unfavorite : AppIcons.favorite}
          style={{backgroundColor: theme.colors.elevation.level4}}
          onPress={() => handleFavorite(swipeable)}
          refreshing={favoriteRefreshing}
          disabled={!!props.fez.members?.isMuted || favoriteRefreshing}
        />
        <SwipeableButton
          testID={'seamailRead-button'}
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
      key={`${props.fez.fezID}-${props.fez.members?.isMuted}-${props.fez.members?.isFavorite}`}
      enabled={props.enabled !== undefined ? props.enabled && !!props.fez.members : !!props.fez.members}
      renderLeftPanel={showParentScreen ? renderLeftPanel : undefined}
      renderRightPanel={renderRightPanel}>
      {props.children}
    </BaseSwipeable>
  );
};
