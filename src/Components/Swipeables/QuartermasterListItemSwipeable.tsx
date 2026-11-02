import React, {PropsWithChildren, useCallback, useMemo} from 'react';
import {StyleSheet} from 'react-native';
import {SwipeableMethods} from 'react-native-gesture-handler/ReanimatedSwipeable';
import {SharedValue} from 'react-native-reanimated';

import {SwipeableButton} from '#src/Components/Buttons/SwipeableButton';
import {BaseSwipeable} from '#src/Components/Swipeables/BaseSwipeable';
import {useAppTheme} from '#src/Context/Contexts/ThemeContext';
import {AppIcons} from '#src/Enums/Icons';
import {useQuartermasterDelete} from '#src/Hooks/Quartermaster/useQuartermasterDelete';
import {useQuartermasterViewer} from '#src/Hooks/Quartermaster/useQuartermasterViewer';
import {
  canMessageQuartermasterOwner,
  canModifyQuartermasterItem,
  getQuartermasterSeamailSubject,
  isOwnQuartermasterItem,
} from '#src/Libraries/Quartermaster/QuartermasterAccess';
import {CommonStackComponents, useCommonStack} from '#src/Navigation/Stacks/Common/CommonStackComponents';
import {QuartermasterData} from '#src/Structs/ControllerStructs';

interface QuartermasterListItemSwipeableProps extends PropsWithChildren {
  item: QuartermasterData;
  /** False for restricted items the viewer may not act on. */
  enabled?: boolean;
}

/**
 * Swipe actions for a Quartermastarr row: Delete (with confirmation) on the viewer's own
 * items, Seamail on everyone else's when the owner's name is visible.
 */
export const QuartermasterListItemSwipeable = ({
  item,
  enabled = true,
  children,
}: QuartermasterListItemSwipeableProps) => {
  const {theme} = useAppTheme();
  const styles = useMemo(
    () =>
      StyleSheet.create({
        deleteButton: {backgroundColor: theme.colors.errorContainer},
        deleteText: {color: theme.colors.onErrorContainer},
        seamailButton: {backgroundColor: theme.colors.twitarrNeutralButton},
        seamailText: {color: theme.colors.onTwitarrNeutralButton},
      }),
    [theme.colors],
  );
  const navigation = useCommonStack();
  const viewer = useQuartermasterViewer();
  const {confirmAndDelete, isPending: isDeleting} = useQuartermasterDelete();

  const isOwn = isOwnQuartermasterItem(item, viewer);
  const canDelete = isOwn && canModifyQuartermasterItem(item, viewer);
  const canMessage = canMessageQuartermasterOwner(item, viewer);

  /**
   * Confirms, then closes the row and deletes.
   */
  const handleDelete = useCallback(
    (swipeable: SwipeableMethods) => {
      confirmAndDelete(item, {onConfirm: () => swipeable.close()});
    },
    [confirmAndDelete, item],
  );

  /**
   * Navigates first, then closes the row, so the swipe doesn't snap shut over the transition.
   */
  const handleMessage = useCallback(
    (swipeable: SwipeableMethods) => {
      if (!item.owner) {
        return;
      }
      navigation.push(CommonStackComponents.seamailCreateScreen, {
        initialUserHeaders: [item.owner],
        initialTitle: getQuartermasterSeamailSubject(item),
      });
      swipeable.close();
    },
    [navigation, item],
  );

  const renderRightPanel = (
    _progress: SharedValue<number>,
    _translation: SharedValue<number>,
    swipeable: SwipeableMethods,
  ) => {
    if (canDelete) {
      return (
        <SwipeableButton
          testID={'quartermasterDelete-button'}
          text={'Delete'}
          iconName={AppIcons.delete}
          refreshing={isDeleting}
          disabled={isDeleting}
          onPress={() => handleDelete(swipeable)}
          style={styles.deleteButton}
          textStyle={styles.deleteText}
          iconColor={theme.colors.onErrorContainer}
        />
      );
    }
    if (canMessage) {
      return (
        <SwipeableButton
          testID={'quartermasterSeamail-button'}
          text={'Seamail'}
          iconName={AppIcons.seamail}
          onPress={() => handleMessage(swipeable)}
          style={styles.seamailButton}
          textStyle={styles.seamailText}
          iconColor={theme.colors.onTwitarrNeutralButton}
        />
      );
    }
    return null;
  };

  return (
    <BaseSwipeable enabled={enabled && (canDelete || canMessage)} renderRightPanel={renderRightPanel}>
      {children}
    </BaseSwipeable>
  );
};
