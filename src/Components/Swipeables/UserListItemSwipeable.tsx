import React, {PropsWithChildren} from 'react';
import {SwipeableMethods} from 'react-native-gesture-handler/ReanimatedSwipeable';
import {SharedValue} from 'react-native-reanimated';

import {SwipeableButton} from '#src/Components/Buttons/SwipeableButton';
import {BaseSwipeable} from '#src/Components/Swipeables/BaseSwipeable';
import {useAppTheme} from '#src/Context/Contexts/ThemeContext';
import {AppIcons} from '#src/Enums/Icons';
import {CommonStackComponents, useCommonStack} from '#src/Navigation/CommonScreens';
import {ChatStackScreenComponents} from '#src/Navigation/Stacks/ChatStackNavigator';
import {BottomTabComponents, useBottomTabNavigator} from '#src/Navigation/Tabs/BottomTabNavigator';
import {UserHeader} from '#src/Structs/ControllerStructs';

interface UserListItemSwipeableProps extends PropsWithChildren {
  userHeader: UserHeader;
  enabled?: boolean;
  relationActionLabel: string;
  relationActionIcon: AppIcons;
  onRelationAction: (userHeader: UserHeader) => void;
  relationActionRefreshing?: boolean;
}

export const UserListItemSwipeable = ({
  userHeader,
  children,
  enabled = true,
  relationActionLabel,
  relationActionIcon,
  onRelationAction,
  relationActionRefreshing = false,
}: UserListItemSwipeableProps) => {
  const {theme} = useAppTheme();
  const commonNavigation = useCommonStack();
  const bottomTabNavigation = useBottomTabNavigator();

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

  const renderRightPanel = (
    progressAnimatedValue: SharedValue<number>,
    dragAnimatedValue: SharedValue<number>,
    swipeable: SwipeableMethods,
  ) => {
    return (
      <>
        <SwipeableButton
          text={'Remove'}
          iconName={AppIcons.delete}
          style={{backgroundColor: theme.colors.elevation.level2}}
          onPress={() => {
            onRelationAction(userHeader);
            swipeable.reset();
          }}
          refreshing={relationActionRefreshing}
        />
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
      </>
    );
  };

  return (
    <BaseSwipeable
      key={`${userHeader.userID}-${relationActionLabel}`}
      enabled={enabled}
      renderRightPanel={renderRightPanel}>
      {children}
    </BaseSwipeable>
  );
};
