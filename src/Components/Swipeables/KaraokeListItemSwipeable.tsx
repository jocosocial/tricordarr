import React, {PropsWithChildren, useCallback, useMemo} from 'react';
import {StyleSheet} from 'react-native';
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
 * The favorite pending flag is derived from the mutation's variables so a recycled cell never
 * inherits another song's spinner.
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
  const {songID, artist, songName, isFavorite} = song;

  const favoriteRefreshing = favoriteMutation.isPending && favoriteMutation.variables?.songID === songID;
  const showLogButton = showLogButtonProp !== false && hasKaraokeManager;

  const styles = useMemo(
    () =>
      StyleSheet.create({
        favorite: {backgroundColor: theme.colors.elevation.level1},
        log: {backgroundColor: theme.colors.elevation.level2},
      }),
    [theme],
  );

  /** Toggle favorite. Disabled in the panel while in flight. */
  const handleFavorite = useCallback(
    (swipeable: SwipeableMethods) => {
      favoriteMutation.mutate(
        {songID, action: isFavorite ? 'unfavorite' : 'favorite'},
        {onSettled: () => swipeable.close()},
      );
    },
    [favoriteMutation, songID, isFavorite],
  );

  /** Open the log-performance screen for this song, then close the swipeable. */
  const handleLog = useCallback(
    (swipeable: SwipeableMethods) => {
      swipeable.close();
      navigation.push(MainStackComponents.karaokeLogPerformanceScreen, {songID, artist, songName});
    },
    [navigation, songID, artist, songName],
  );

  /** Favorite, plus Log for karaoke managers. */
  const renderRightPanel = useCallback(
    (
      _progressAnimatedValue: SharedValue<number>,
      _dragAnimatedValue: SharedValue<number>,
      swipeable: SwipeableMethods,
    ) => (
      <>
        <SwipeableButton
          testID={'karaokeFavorite-button'}
          text={isFavorite ? 'Unfavorite' : 'Favorite'}
          iconName={isFavorite ? AppIcons.unfavorite : AppIcons.favorite}
          onPress={() => handleFavorite(swipeable)}
          refreshing={favoriteRefreshing}
          disabled={favoriteRefreshing}
          style={styles.favorite}
        />
        {showLogButton && (
          <SwipeableButton
            testID={'karaokeLog-button'}
            text={'Log'}
            iconName={AppIcons.karaokeLog}
            onPress={() => handleLog(swipeable)}
            style={styles.log}
          />
        )}
      </>
    ),
    [isFavorite, favoriteRefreshing, showLogButton, styles, handleFavorite, handleLog],
  );

  return (
    <BaseSwipeable key={songID} enabled={enabled && isLoggedIn} renderRightPanel={renderRightPanel}>
      {children}
    </BaseSwipeable>
  );
};
