import {useQueryClient} from '@tanstack/react-query';
import React, {PropsWithChildren, useCallback, useMemo} from 'react';
import {StyleSheet} from 'react-native';
import {SwipeableMethods} from 'react-native-gesture-handler/ReanimatedSwipeable';
import {SharedValue} from 'react-native-reanimated';

import {SwipeableButton} from '#src/Components/Buttons/SwipeableButton';
import {BaseSwipeable} from '#src/Components/Swipeables/BaseSwipeable';
import {useSession} from '#src/Context/Contexts/SessionContext';
import {useAppTheme} from '#src/Context/Contexts/ThemeContext';
import {AppIcons} from '#src/Enums/Icons';
import {MainStackComponents, useMainStack} from '#src/Navigation/Stacks/Main/MainStackComponents';
import {useBoardgameFavoriteMutation} from '#src/Queries/Boardgames/BoardgameMutations';
import {BoardgameData} from '#src/Structs/ControllerStructs';

interface BoardgameListItemSwipeableProps extends PropsWithChildren {
  boardgame: BoardgameData;
  enabled?: boolean;
}

/**
 * Favorite and Create LFG both require a token, so swiping is disabled entirely while
 * logged out rather than surfacing buttons that would 401. The favorite pending flag is derived
 * from the mutation's variables so a recycled cell never inherits another game's spinner.
 */
export const BoardgameListItemSwipeable = (props: BoardgameListItemSwipeableProps) => {
  const {theme} = useAppTheme();
  const {isLoggedIn} = useSession();
  const favoriteMutation = useBoardgameFavoriteMutation();
  const queryClient = useQueryClient();
  const navigation = useMainStack();
  const {gameID, isFavorite} = props.boardgame;

  const favoriteRefreshing = favoriteMutation.isPending && favoriteMutation.variables?.boardgameID === gameID;

  const styles = useMemo(
    () =>
      StyleSheet.create({
        favorite: {backgroundColor: theme.colors.elevation.level1},
        lfg: {backgroundColor: theme.colors.elevation.level2},
      }),
    [theme],
  );

  /** Toggle favorite, then refetch the boardgame caches. Disabled in the panel while in flight. */
  const handleFavorite = useCallback(
    (swipeable: SwipeableMethods) => {
      favoriteMutation.mutate(
        {
          boardgameID: gameID,
          action: isFavorite ? 'unfavorite' : 'favorite',
        },
        {
          onSuccess: async () => {
            const invalidations = BoardgameData.getCacheKeys(gameID).map(key => {
              return queryClient.invalidateQueries({queryKey: key});
            });
            await Promise.all(invalidations);
          },
          onSettled: () => swipeable.close(),
        },
      );
    },
    [favoriteMutation, gameID, isFavorite, queryClient],
  );

  /** Open the create-LFG screen for this game, then close the swipeable. */
  const handleLFG = useCallback(
    (swipeable: SwipeableMethods) => {
      swipeable.close();
      navigation.push(MainStackComponents.boardgameCreateLfgScreen, {
        boardgame: props.boardgame,
      });
    },
    [navigation, props.boardgame],
  );

  /** Favorite and LFG. */
  const renderRightPanel = useCallback(
    (
      _progressAnimatedValue: SharedValue<number>,
      _dragAnimatedValue: SharedValue<number>,
      swipeable: SwipeableMethods,
    ) => (
      <>
        <SwipeableButton
          testID={'boardgameFavorite-button'}
          text={isFavorite ? 'Unfavorite' : 'Favorite'}
          iconName={isFavorite ? AppIcons.unfavorite : AppIcons.favorite}
          onPress={() => handleFavorite(swipeable)}
          refreshing={favoriteRefreshing}
          disabled={favoriteRefreshing}
          style={styles.favorite}
        />
        <SwipeableButton
          testID={'boardgameLfg-button'}
          text={'LFG'}
          iconName={AppIcons.lfgCreate}
          onPress={() => handleLFG(swipeable)}
          style={styles.lfg}
        />
      </>
    ),
    [isFavorite, favoriteRefreshing, styles, handleFavorite, handleLFG],
  );

  return (
    <BaseSwipeable key={gameID} enabled={(props.enabled ?? true) && isLoggedIn} renderRightPanel={renderRightPanel}>
      {props.children}
    </BaseSwipeable>
  );
};
