import React, {PropsWithChildren, useCallback, useMemo} from 'react';
import {StyleSheet} from 'react-native';
import {SwipeableMethods} from 'react-native-gesture-handler/ReanimatedSwipeable';
import {SharedValue} from 'react-native-reanimated';

import {SwipeableButton} from '#src/Components/Buttons/SwipeableButton';
import {BaseSwipeable} from '#src/Components/Swipeables/BaseSwipeable';
import {useAppTheme} from '#src/Context/Contexts/ThemeContext';
import {AppIcons} from '#src/Enums/Icons';
import {usePerformerCacheReducer} from '#src/Hooks/Performer/usePerformerCacheReducer';
import {usePerformerEventUnlinkMutation} from '#src/Queries/Performer/PerformerMutations';
import {PerformerHeaderData} from '#src/Structs/ControllerStructs';

interface EventPerformerListItemSwipeableProps extends PropsWithChildren {
  performer: PerformerHeaderData;
  eventID: string;
  enabled?: boolean;
}

/**
 * TwitarrTeam swipe-to-unlink for a performer linked to an event.
 */
export const EventPerformerListItemSwipeable = ({
  performer,
  eventID,
  children,
  enabled = true,
}: EventPerformerListItemSwipeableProps) => {
  const {theme} = useAppTheme();
  const {unlinkPerformerFromEvent} = usePerformerCacheReducer();
  const {mutate: unlinkMutate, isPending: unlinkIsPending} = usePerformerEventUnlinkMutation();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        unlink: {backgroundColor: theme.colors.twitarrNegativeButton},
        unlinkText: {color: theme.colors.onTwitarrNegativeButton},
      }),
    [theme],
  );

  /**
   * Close the swipeable and unlink the performer from the event. Closes before mutating:
   * onSuccess drops the row from the event cache, which unmounts this swipeable, so an
   * onSettled close would act on a torn-down view.
   */
  const handleUnlink = useCallback(
    (swipeable: SwipeableMethods) => {
      const performerID = performer.id;
      if (!performerID) {
        return;
      }
      swipeable.close();
      unlinkMutate(
        {performerID, eventID},
        {
          onSuccess: () => unlinkPerformerFromEvent(performerID, eventID),
        },
      );
    },
    [performer.id, eventID, unlinkMutate, unlinkPerformerFromEvent],
  );

  const renderRightPanel = useCallback(
    (
      progressAnimatedValue: SharedValue<number>,
      dragAnimatedValue: SharedValue<number>,
      swipeable: SwipeableMethods,
    ) => (
      <SwipeableButton
        testID={'eventPerformerUnlink-button'}
        text={'Unlink'}
        iconName={AppIcons.performerUnlink}
        style={styles.unlink}
        textStyle={styles.unlinkText}
        iconColor={theme.colors.onTwitarrNegativeButton}
        onPress={() => handleUnlink(swipeable)}
        refreshing={unlinkIsPending}
        disabled={unlinkIsPending}
      />
    ),
    [styles, theme, handleUnlink, unlinkIsPending],
  );

  return (
    <BaseSwipeable
      key={`${performer.id}-${eventID}`}
      enabled={enabled && !!performer.id}
      renderRightPanel={renderRightPanel}>
      {children}
    </BaseSwipeable>
  );
};
