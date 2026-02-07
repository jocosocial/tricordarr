import {useQueryClient} from '@tanstack/react-query';
import React, {PropsWithChildren, useCallback} from 'react';
import {SwipeableMethods} from 'react-native-gesture-handler/ReanimatedSwipeable';
import {SharedValue} from 'react-native-reanimated';

import {SwipeableButton} from '#src/Components/Buttons/SwipeableButton';
import {BaseSwipeable} from '#src/Components/Swipeables/BaseSwipeable';
import {useRoles} from '#src/Context/Contexts/RoleContext';
import {useAppTheme} from '#src/Context/Contexts/ThemeContext';
import {AppIcons} from '#src/Enums/Icons';
import {useRefresh} from '#src/Hooks/useRefresh';
import {MainStackComponents, useMainStack} from '#src/Navigation/Stacks/MainStackNavigator';
import {useKaraokeFavoriteMutation} from '#src/Queries/Karaoke/KaraokeMutations';
import {KaraokeSongData} from '#src/Structs/ControllerStructs';

interface KaraokeListItemSwipeableProps extends PropsWithChildren {
  song: KaraokeSongData;
  enabled?: boolean;
  /** When true, show Log action (karaokemanager). */
  showLogButton?: boolean;
}

export const KaraokeListItemSwipeable = ({
  children,
  song,
  enabled = true,
  showLogButton: showLogButtonProp,
}: KaraokeListItemSwipeableProps) => {
  const {theme} = useAppTheme();
  const navigation = useMainStack();
  const queryClient = useQueryClient();
  const favoriteMutation = useKaraokeFavoriteMutation();
  const {hasKaraokeManager} = useRoles();
  const {refreshing, setRefreshing} = useRefresh({});

  const showLogButton = showLogButtonProp !== false && hasKaraokeManager;
  const invalidationKeys = KaraokeSongData.getCacheKeys(song.songID);

  const handleFavorite = useCallback(
    (swipeable: SwipeableMethods) => {
      setRefreshing(true);
      favoriteMutation.mutate(
        {
          songID: song.songID,
          action: song.isFavorite ? 'unfavorite' : 'favorite',
        },
        {
          onSuccess: async () => {
            await Promise.all(invalidationKeys.map(key => queryClient.invalidateQueries({queryKey: key})));
          },
          onSettled: () => {
            setRefreshing(false);
            swipeable.reset();
          },
        },
      );
    },
    [favoriteMutation, song.songID, song.isFavorite, invalidationKeys, queryClient, setRefreshing],
  );

  const handleLog = useCallback(
    (swipeable: SwipeableMethods) => {
      swipeable.reset();
      navigation.push(MainStackComponents.karaokeLogPerformanceScreen, {
        songID: song.songID,
        artist: song.artist,
        songName: song.songName,
      });
    },
    [navigation, song.songID, song.artist, song.songName],
  );

  const renderRightPanel = (
    _progressAnimatedValue: SharedValue<number>,
    _dragAnimatedValue: SharedValue<number>,
    swipeable: SwipeableMethods,
  ) => {
    return (
      <SwipeableButton
        text={song.isFavorite ? 'Unfavorite' : 'Favorite'}
        iconName={song.isFavorite ? AppIcons.unfavorite : AppIcons.favorite}
        onPress={() => handleFavorite(swipeable)}
        refreshing={refreshing}
        style={{backgroundColor: theme.colors.elevation.level1}}
      />
    );
  };

  const renderLeftPanel = (
    _progressAnimatedValue: SharedValue<number>,
    _dragAnimatedValue: SharedValue<number>,
    swipeable: SwipeableMethods,
  ) => {
    if (!showLogButton) return null;
    return (
      <SwipeableButton
        text={'Log'}
        iconName={AppIcons.edit}
        onPress={() => handleLog(swipeable)}
        style={{backgroundColor: theme.colors.elevation.level2}}
      />
    );
  };

  return (
    <BaseSwipeable enabled={enabled} renderLeftPanel={renderLeftPanel} renderRightPanel={renderRightPanel}>
      {children}
    </BaseSwipeable>
  );
};
