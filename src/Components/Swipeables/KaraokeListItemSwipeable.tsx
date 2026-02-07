import React, {PropsWithChildren, useCallback} from 'react';
import {SwipeableMethods} from 'react-native-gesture-handler/ReanimatedSwipeable';
import {SharedValue} from 'react-native-reanimated';

import {SwipeableButton} from '#src/Components/Buttons/SwipeableButton';
import {BaseSwipeable} from '#src/Components/Swipeables/BaseSwipeable';
import {useRoles} from '#src/Context/Contexts/RoleContext';
import {useAppTheme} from '#src/Context/Contexts/ThemeContext';
import {AppIcons} from '#src/Enums/Icons';
import {MainStackComponents, useMainStack} from '#src/Navigation/Stacks/MainStackNavigator';
import {KaraokePerformedSongsData, KaraokeSongData} from '#src/Structs/ControllerStructs';

interface KaraokeListItemSwipeableProps extends PropsWithChildren {
  song: KaraokePerformedSongsData | KaraokeSongData;
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
  const {hasKaraokeManager} = useRoles();

  const showLogButton = showLogButtonProp !== false && hasKaraokeManager;

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
    if (!showLogButton) return null;
    return (
      <SwipeableButton
        text={'Log'}
        iconName={AppIcons.karaokeLog}
        onPress={() => handleLog(swipeable)}
        style={{backgroundColor: theme.colors.elevation.level1}}
      />
    );
  };

  return (
    <BaseSwipeable enabled={enabled} renderRightPanel={renderRightPanel}>
      {children}
    </BaseSwipeable>
  );
};
