import React, {PropsWithChildren, useCallback, useMemo, useState} from 'react';
import {StyleSheet} from 'react-native';
import {SwipeableMethods} from 'react-native-gesture-handler/ReanimatedSwipeable';
import {SharedValue} from 'react-native-reanimated';

import {SwipeableButton} from '#src/Components/Buttons/SwipeableButton';
import {BaseSwipeable} from '#src/Components/Swipeables/BaseSwipeable';
import {usePreRegistration} from '#src/Context/Contexts/PreRegistrationContext';
import {useAppTheme} from '#src/Context/Contexts/ThemeContext';
import {AppIcons} from '#src/Enums/Icons';
import {useUserCacheReducer} from '#src/Hooks/User/useUserCacheReducer';
import {CommonStackComponents, useCommonStack} from '#src/Navigation/Stacks/Common/CommonStackComponents';
import {useUserBlockMutation} from '#src/Queries/Users/UserBlockMutations';
import {useUserFavoriteMutation} from '#src/Queries/Users/UserFavoriteMutations';
import {useUserMuteMutation} from '#src/Queries/Users/UserMuteMutations';
import {USER_RELATION_ACTIONS, type UserRelationMode} from '#src/Queries/Users/UserRelationConstants';
import {UserHeader} from '#src/Structs/ControllerStructs';

interface UserListItemSwipeableProps extends PropsWithChildren {
  userHeader: UserHeader;
  mode: UserRelationMode;
  enabled?: boolean;
}

export const UserListItemSwipeable = ({userHeader, mode, children, enabled = true}: UserListItemSwipeableProps) => {
  const {theme} = useAppTheme();
  const {preRegistrationMode} = usePreRegistration();
  const commonNavigation = useCommonStack();
  const {removeRelation} = useUserCacheReducer();
  const favoriteMutation = useUserFavoriteMutation();
  const muteMutation = useUserMuteMutation();
  const blockMutation = useUserBlockMutation();
  const [removeRefreshing, setRemoveRefreshing] = useState(false);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        // level1/3/5 rather than adjacent levels: Paper's tonal elevation steps are subtle,
        // and adjacent levels (e.g. 3 and 4) read as the same color side by side.
        seamail: {backgroundColor: theme.colors.elevation.level1},
        call: {backgroundColor: theme.colors.elevation.level3},
        event: {backgroundColor: theme.colors.elevation.level5},
        remove: {backgroundColor: theme.colors.twitarrNegativeButton},
        removeText: {color: theme.colors.onTwitarrNegativeButton},
      }),
    [theme],
  );

  /**
   * Close the swipeable and remove the user from this relation list (favorite/mute/block).
   * Closes before mutating: onSuccess drops the row from the cache via removeRelation, which
   * unmounts this swipeable, so an onSettled close would act on a torn-down view.
   */
  const handleRemoveRelation = useCallback(
    (swipeable: SwipeableMethods) => {
      setRemoveRefreshing(true);
      swipeable.close();
      const onSuccess = () => removeRelation(mode, userHeader);
      const onSettled = () => setRemoveRefreshing(false);

      if (mode === 'favorite') {
        favoriteMutation.mutate(
          {action: USER_RELATION_ACTIONS[mode].remove as 'unfavorite', userID: userHeader.userID},
          {onSuccess, onSettled},
        );
      } else if (mode === 'mute') {
        muteMutation.mutate(
          {action: USER_RELATION_ACTIONS[mode].remove as 'unmute', userID: userHeader.userID},
          {onSuccess, onSettled},
        );
      } else {
        blockMutation.mutate(
          {action: USER_RELATION_ACTIONS[mode].remove as 'unblock', userID: userHeader.userID},
          {onSuccess, onSettled},
        );
      }
    },
    [mode, userHeader, removeRelation, favoriteMutation, muteMutation, blockMutation],
  );

  /**
   * Start a Seamail with this user, then close the swipeable. Navigating first so the screen
   * push isn't competing with the swipeable's own close animation; the row is still closed by
   * the time the user navigates back.
   */
  const handleSeamail = useCallback(
    (swipeable: SwipeableMethods) => {
      commonNavigation.push(CommonStackComponents.seamailCreateScreen, {
        initialUserHeaders: [userHeader],
      });
      swipeable.close();
    },
    [commonNavigation, userHeader],
  );

  /**
   * Start a KrakenTalk call with this user, then close the swipeable. See handleSeamail for why
   * navigation comes first.
   */
  const handleCall = useCallback(
    (swipeable: SwipeableMethods) => {
      commonNavigation.push(CommonStackComponents.krakenTalkCreateScreen, {
        initialUserHeader: userHeader,
      });
      swipeable.close();
    },
    [commonNavigation, userHeader],
  );

  /**
   * Create a personal event inviting this user, then close the swipeable. See handleSeamail for
   * why navigation comes first.
   */
  const handleScheduleEvent = useCallback(
    (swipeable: SwipeableMethods) => {
      commonNavigation.push(CommonStackComponents.personalEventCreateScreen, {
        initialUserHeaders: [userHeader],
      });
      swipeable.close();
    },
    [commonNavigation, userHeader],
  );

  /**
   * Seamail/Call/Event, favorites list only. Undefined (rather than an empty fragment) for
   * mute/block so BaseSwipeable doesn't stand up an empty right panel.
   */
  const renderRightPanel = useCallback(
    (
      progressAnimatedValue: SharedValue<number>,
      dragAnimatedValue: SharedValue<number>,
      swipeable: SwipeableMethods,
    ) => (
      <>
        <SwipeableButton
          testID={'userListSeamail-button'}
          text={'Seamail'}
          iconName={AppIcons.seamail}
          style={styles.seamail}
          onPress={() => handleSeamail(swipeable)}
        />
        <SwipeableButton
          testID={'userListCall-button'}
          text={'Call'}
          iconName={AppIcons.krakentalkCreate}
          style={styles.call}
          onPress={() => handleCall(swipeable)}
        />
        <SwipeableButton
          testID={'userListEvent-button'}
          text={'Event'}
          iconName={AppIcons.eventCreate}
          style={styles.event}
          onPress={() => handleScheduleEvent(swipeable)}
        />
      </>
    ),
    [styles, handleSeamail, handleCall, handleScheduleEvent],
  );

  /**
   * Remove, all three relation modes. Opposite side from renderRightPanel so the destructive
   * action never shares a swipe direction with Seamail/Call/Event.
   */
  const renderLeftPanel = useCallback(
    (
      progressAnimatedValue: SharedValue<number>,
      dragAnimatedValue: SharedValue<number>,
      swipeable: SwipeableMethods,
    ) => (
      <SwipeableButton
        testID={'userListRemove-button'}
        text={'Remove'}
        iconName={AppIcons.delete}
        style={styles.remove}
        textStyle={styles.removeText}
        iconColor={theme.colors.onTwitarrNegativeButton}
        onPress={() => handleRemoveRelation(swipeable)}
        refreshing={removeRefreshing}
        disabled={removeRefreshing}
      />
    ),
    [styles, theme, handleRemoveRelation, removeRefreshing],
  );

  const showRightPanel = mode === 'favorite' && !preRegistrationMode;

  return (
    <BaseSwipeable
      key={`${userHeader.userID}-${mode}`}
      enabled={enabled}
      renderLeftPanel={renderLeftPanel}
      renderRightPanel={showRightPanel ? renderRightPanel : undefined}>
      {children}
    </BaseSwipeable>
  );
};
