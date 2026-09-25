import React, {PropsWithChildren, useCallback, useState} from 'react';
import {SwipeableMethods} from 'react-native-gesture-handler/ReanimatedSwipeable';
import {SharedValue} from 'react-native-reanimated';

import {SwipeableButton} from '#src/Components/Buttons/SwipeableButton';
import {BaseSwipeable} from '#src/Components/Swipeables/BaseSwipeable';
import {useRoles} from '#src/Context/Contexts/RoleContext';
import {useSession} from '#src/Context/Contexts/SessionContext';
import {useAppTheme} from '#src/Context/Contexts/ThemeContext';
import {AppIcons} from '#src/Enums/Icons';
import {MainStackComponents, useMainStack} from '#src/Navigation/Stacks/Main/MainStackComponents';
import {useKaraokeFavoriteMutation} from '#src/Queries/Karaoke/KaraokeMutations';
import {KaraokePerformedSongsData, KaraokeSongData} from '#src/Structs/ControllerStructs';

interface KaraokeListItemSwipeableProps extends PropsWithChildren {
  song: KaraokePerformedSongsData | KaraokeSongData;
  enabled?: boolean;
  /** When true, show Log action (karaokemanager). */
  showLogButton?: boolean;
}

/**
 * Swipe actions for a karaoke song row: Favorite (any logged-in user) and Log
 * (karaokemanager only). Swiping is disabled entirely while logged out, since
 * favoriting is the only action available to a non-manager and it requires a token.
 */
export const KaraokeListItemSwipeable = ({
  children,
  song,
  enabled = true,
  showLogButton: showLogButtonProp,
}: KaraokeListItemSwipeableProps) => {
  const {theme} = useAppTheme();
  const navigation = useMainStack();
  const {hasKaraokeManager} = useRoles();
  const {isLoggedIn} = useSession();
  const favoriteMutation = useKaraokeFavoriteMutation();
  const [favoriteRefreshing, setFavoriteRefreshing] = useState(false);

  const showLogButton = showLogButtonProp !== false && hasKaraokeManager;

  const handleFavorite = useCallback(
    (swipeable: SwipeableMethods) => {
      setFavoriteRefreshing(true);
      favoriteMutation.mutate(
        {songID: song.songID, action: song.isFavorite ? 'unfavorite' : 'favorite'},
        {
          onSettled: () => {
            setFavoriteRefreshing(false);
            swipeable.close();
          },
        },
      );
    },
    [favoriteMutation, song.songID, song.isFavorite],
  );

  const handleLog = useCallback(
    (swipeable: SwipeableMethods) => {
      swipeable.close();
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
      <>
        <SwipeableButton
          testID={'karaokeFavorite-button'}
          text={song.isFavorite ? 'Unfavorite' : 'Favorite'}
          iconName={song.isFavorite ? AppIcons.unfavorite : AppIcons.favorite}
          onPress={() => handleFavorite(swipeable)}
          refreshing={favoriteRefreshing}
          style={{backgroundColor: theme.colors.elevation.level1}}
        />
        {showLogButton && (
          <SwipeableButton
            testID={'karaokeLog-button'}
            text={'Log'}
            iconName={AppIcons.karaokeLog}
            onPress={() => handleLog(swipeable)}
            style={{backgroundColor: theme.colors.elevation.level2}}
          />
        )}
      </>
    );
  };

  return (
    <BaseSwipeable key={song.songID} enabled={enabled && isLoggedIn} renderRightPanel={renderRightPanel}>
      {children}
    </BaseSwipeable>
  );
};
