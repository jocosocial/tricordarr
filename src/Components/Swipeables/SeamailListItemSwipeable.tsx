import {useQueryClient} from '@tanstack/react-query';
import React, {PropsWithChildren, useCallback, useEffect, useState} from 'react';
import {SwipeableMethods} from 'react-native-gesture-handler/ReanimatedSwipeable';
import {SharedValue} from 'react-native-reanimated';

import {SwipeableButton} from '#src/Components/Buttons/SwipeableButton';
import {BaseSwipeable} from '#src/Components/Swipeables/BaseSwipeable';
import {useAppTheme} from '#src/Context/Contexts/ThemeContext';
import {AppIcons} from '#src/Enums/Icons';
import {useFezMuteMutation} from '#src/Queries/Fez/FezMuteMutations';
import {FezData} from '#src/Structs/ControllerStructs';

interface SeamailListItemSwipeableProps extends PropsWithChildren {
  fez: FezData;
}

export const SeamailListItemSwipeable = (props: SeamailListItemSwipeableProps) => {
  const {theme} = useAppTheme();
  const muteMutation = useFezMuteMutation();
  const queryClient = useQueryClient();
  const [muteRefreshing, setMuteRefreshing] = useState(false);
  // The optimistic state is needed to ensure that the swipeable doesnt leave visual ghosts
  // when the mute state changes. Maybe some day removing the mutation invalidation pattern
  // can improve this behavior. They addition of the key was key.
  const [optimisticMuted, setOptimisticMuted] = useState<boolean | undefined>(props.fez.members?.isMuted);

  // Sync optimistic state with props when they change
  useEffect(() => {
    setOptimisticMuted(props.fez.members?.isMuted);
  }, [props.fez.members?.isMuted]);

  const handleMute = useCallback(
    (swipeable: SwipeableMethods) => {
      if (!props.fez.members) {
        return;
      }
      // Optimistically update the UI immediately
      setOptimisticMuted(!props.fez.members.isMuted);
      setMuteRefreshing(true);
      const action = props.fez.members.isMuted ? 'unmute' : 'mute';
      muteMutation.mutate(
        {
          action: action,
          fezID: props.fez.fezID,
        },
        {
          onSuccess: async () => {
            const invalidations = FezData.getCacheKeys(props.fez.fezID).map(key => {
              return queryClient.invalidateQueries({queryKey: key});
            });
            await Promise.all(invalidations);
          },
          onSettled: () => {
            setMuteRefreshing(false);
            swipeable.reset();
          },
        },
      );
    },
    [muteMutation, props.fez.fezID, props.fez.members, queryClient],
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
      <SwipeableButton
        text={optimisticMuted ? 'Unmute' : 'Mute'}
        iconName={optimisticMuted ? AppIcons.unmute : AppIcons.mute}
        style={{backgroundColor: theme.colors.elevation.level2}}
        onPress={() => handleMute(swipeable)}
        refreshing={muteRefreshing}
      />
    );
  };

  return (
    <BaseSwipeable
      key={`${props.fez.fezID}-${optimisticMuted}`}
      enabled={!!props.fez.members}
      renderRightPanel={renderRightPanel}>
      {props.children}
    </BaseSwipeable>
  );
};
