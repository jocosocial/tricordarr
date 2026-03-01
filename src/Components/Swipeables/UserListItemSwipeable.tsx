import React, {PropsWithChildren, useCallback, useState} from 'react';
import {SwipeableMethods} from 'react-native-gesture-handler/ReanimatedSwipeable';
import {SharedValue} from 'react-native-reanimated';

import {SwipeableButton} from '#src/Components/Buttons/SwipeableButton';
import {BaseSwipeable} from '#src/Components/Swipeables/BaseSwipeable';
import {useAppTheme} from '#src/Context/Contexts/ThemeContext';
import {AppIcons} from '#src/Enums/Icons';
import {useUserCacheReducer} from '#src/Hooks/User/useUserCacheReducer';
import {CommonStackComponents, useCommonStack} from '#src/Navigation/CommonScreens';
import {ChatStackScreenComponents} from '#src/Navigation/Stacks/ChatStackNavigator';
import {BottomTabComponents, useBottomTabNavigator} from '#src/Navigation/Tabs/BottomTabNavigator';
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
  const commonNavigation = useCommonStack();
  const bottomTabNavigation = useBottomTabNavigator();
  const {removeRelation} = useUserCacheReducer();
  const favoriteMutation = useUserFavoriteMutation();
  const muteMutation = useUserMuteMutation();
  const blockMutation = useUserBlockMutation();
  const [removeRefreshing, setRemoveRefreshing] = useState(false);

  const handleRemoveRelation = useCallback(
    (swipeable: SwipeableMethods) => {
      setRemoveRefreshing(true);
      const onSuccess = () => removeRelation(mode, userHeader);
      const onSettled = () => {
        setRemoveRefreshing(false);
        swipeable.reset();
      };

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

  const handleSeamail = (swipeable: SwipeableMethods) => {
    swipeable.reset();
    commonNavigation.push(CommonStackComponents.seamailCreateScreen, {
      initialUserHeaders: [userHeader],
    });
  };

  const handleCall = (swipeable: SwipeableMethods) => {
    swipeable.reset();
    bottomTabNavigation.navigate(BottomTabComponents.seamailTab, {
      screen: ChatStackScreenComponents.krakentalkCreateScreen,
      params: {initialUserHeader: userHeader},
    });
  };

  const handleScheduleEvent = (swipeable: SwipeableMethods) => {
    swipeable.reset();
    commonNavigation.push(CommonStackComponents.personalEventCreateScreen, {
      initialUserHeaders: [userHeader],
    });
  };

  const renderRightPanel = (
    progressAnimatedValue: SharedValue<number>,
    dragAnimatedValue: SharedValue<number>,
    swipeable: SwipeableMethods,
  ) => {
    return (
      <>
        {mode === 'favorite' && (
          <>
            <SwipeableButton
              text={'Seamail'}
              iconName={AppIcons.seamail}
              style={{backgroundColor: theme.colors.elevation.level1}}
              onPress={() => handleSeamail(swipeable)}
            />
            <SwipeableButton
              text={'Call'}
              iconName={AppIcons.krakentalkCreate}
              style={{backgroundColor: theme.colors.elevation.level3}}
              onPress={() => handleCall(swipeable)}
            />
            <SwipeableButton
              text={'Event'}
              iconName={AppIcons.eventCreate}
              style={{backgroundColor: theme.colors.elevation.level4}}
              onPress={() => handleScheduleEvent(swipeable)}
            />
          </>
        )}
        <SwipeableButton
          text={'Remove'}
          iconName={AppIcons.delete}
          style={{backgroundColor: theme.colors.elevation.level2}}
          onPress={() => handleRemoveRelation(swipeable)}
          refreshing={removeRefreshing}
        />
      </>
    );
  };

  return (
    <BaseSwipeable key={`${userHeader.userID}-${mode}`} enabled={enabled} renderRightPanel={renderRightPanel}>
      {children}
    </BaseSwipeable>
  );
};
