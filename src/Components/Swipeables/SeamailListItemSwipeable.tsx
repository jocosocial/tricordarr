import React, {PropsWithChildren, useCallback, useState} from 'react';
import {SwipeableMethods} from 'react-native-gesture-handler/ReanimatedSwipeable';
import {SharedValue} from 'react-native-reanimated';

import {SwipeableButton} from '#src/Components/Buttons/SwipeableButton';
import {BaseSwipeable} from '#src/Components/Swipeables/BaseSwipeable';
import {useAppTheme} from '#src/Context/Contexts/ThemeContext';
import {AppIcons} from '#src/Enums/Icons';
import {useFezCacheReducer} from '#src/Hooks/Fez/useFezCacheReducer';
import {useFezMuteMutation} from '#src/Queries/Fez/FezMuteMutations';
import {useFezQuery} from '#src/Queries/Fez/FezQueries';
import {FezData} from '#src/Structs/ControllerStructs';

interface SeamailListItemSwipeableProps extends PropsWithChildren {
  fez: FezData;
  enabled?: boolean;
}

export const SeamailListItemSwipeable = (props: SeamailListItemSwipeableProps) => {
  const {theme} = useAppTheme();
  const muteMutation = useFezMuteMutation();
  const {refetch} = useFezQuery({fezID: props.fez.fezID, options: {enabled: false}});
  const {updateMute, markRead} = useFezCacheReducer();
  const [muteRefreshing, setMuteRefreshing] = useState(false);
  const [readRefreshing, setReadRefreshing] = useState(false);

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
          onSettled: () => {
            setMuteRefreshing(false);
            swipeable.reset();
          },
        },
      );
    },
    [muteMutation, props.fez.fezID, props.fez.members, updateMute],
  );

  const handleMarkAsRead = useCallback(
    async (swipeable: SwipeableMethods) => {
      swipeable.reset();
      setReadRefreshing(true);
      await refetch();
      markRead(props.fez.fezID);
      setReadRefreshing(false);
      swipeable.reset();
    },
    [refetch, markRead, props.fez.fezID],
  );

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
          text={props.fez.members?.isMuted ? 'Unmute' : 'Mute'}
          iconName={props.fez.members?.isMuted ? AppIcons.unmute : AppIcons.mute}
          style={{backgroundColor: theme.colors.elevation.level2}}
          onPress={() => handleMute(swipeable)}
          refreshing={muteRefreshing}
        />
        <SwipeableButton
          text={'Read'}
          iconName={AppIcons.markAsRead}
          onPress={() => handleMarkAsRead(swipeable)}
          refreshing={readRefreshing}
          style={{backgroundColor: theme.colors.elevation.level3}}
        />
      </>
    );
  };

  return (
    <BaseSwipeable
      key={`${props.fez.fezID}-${props.fez.members?.isMuted}`}
      enabled={props.enabled !== undefined ? props.enabled && !!props.fez.members : !!props.fez.members}
      renderRightPanel={renderRightPanel}>
      {props.children}
    </BaseSwipeable>
  );
};
