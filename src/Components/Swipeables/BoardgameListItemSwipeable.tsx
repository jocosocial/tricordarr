import {useQueryClient} from '@tanstack/react-query';
import React, {PropsWithChildren, useCallback, useState} from 'react';
import {SwipeableMethods} from 'react-native-gesture-handler/ReanimatedSwipeable';
import {SharedValue} from 'react-native-reanimated';

import {SwipeableButton} from '#src/Components/Buttons/SwipeableButton';
import {BaseSwipeable} from '#src/Components/Swipeables/BaseSwipeable';
import {useAppTheme} from '#src/Context/Contexts/ThemeContext';
import {AppIcons} from '#src/Enums/Icons';
import {MainStackComponents, useMainStack} from '#src/Navigation/Stacks/MainStackNavigator';
import {useBoardgameFavoriteMutation} from '#src/Queries/Boardgames/BoardgameMutations';
import {BoardgameData} from '#src/Structs/ControllerStructs';

interface BoardgameListItemSwipeableProps extends PropsWithChildren {
  boardgame: BoardgameData;
  enabled?: boolean;
}

export const BoardgameListItemSwipeable = (props: BoardgameListItemSwipeableProps) => {
  const {theme} = useAppTheme();
  const favoriteMutation = useBoardgameFavoriteMutation();
  const queryClient = useQueryClient();
  const navigation = useMainStack();
  const [favoriteRefreshing, setFavoriteRefreshing] = useState(false);

  const invalidationQueryKeys = BoardgameData.getCacheKeys(props.boardgame.gameID);

  const handleFavorite = useCallback(
    (swipeable: SwipeableMethods) => {
      setFavoriteRefreshing(true);
      favoriteMutation.mutate(
        {
          boardgameID: props.boardgame.gameID,
          action: props.boardgame.isFavorite ? 'unfavorite' : 'favorite',
        },
        {
          onSuccess: async () => {
            const invalidations = invalidationQueryKeys.map(key => {
              return queryClient.invalidateQueries({queryKey: key});
            });
            await Promise.all(invalidations);
          },
          onSettled: () => {
            setFavoriteRefreshing(false);
            swipeable.reset();
          },
        },
      );
    },
    [favoriteMutation, props.boardgame.gameID, props.boardgame.isFavorite, invalidationQueryKeys, queryClient],
  );

  const handleLFG = useCallback(
    (swipeable: SwipeableMethods) => {
      swipeable.reset();
      navigation.push(MainStackComponents.boardgameCreateLfgScreen, {
        boardgame: props.boardgame,
      });
    },
    [navigation, props.boardgame],
  );

  const renderRightPanel = (
    progressAnimatedValue: SharedValue<number>,
    dragAnimatedValue: SharedValue<number>,
    swipeable: SwipeableMethods,
  ) => {
    return (
      <>
        <SwipeableButton
          text={props.boardgame.isFavorite ? 'Unfavorite' : 'Favorite'}
          iconName={props.boardgame.isFavorite ? AppIcons.unfavorite : AppIcons.favorite}
          onPress={() => handleFavorite(swipeable)}
          refreshing={favoriteRefreshing}
          style={{backgroundColor: theme.colors.elevation.level1}}
        />
        <SwipeableButton
          text={'LFG'}
          iconName={AppIcons.lfgCreate}
          onPress={() => handleLFG(swipeable)}
          style={{backgroundColor: theme.colors.elevation.level2}}
        />
      </>
    );
  };

  return (
    <BaseSwipeable key={props.boardgame.gameID} enabled={props.enabled} renderRightPanel={renderRightPanel}>
      {props.children}
    </BaseSwipeable>
  );
};
