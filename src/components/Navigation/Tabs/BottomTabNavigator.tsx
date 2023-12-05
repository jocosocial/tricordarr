import React from 'react';
import {createMaterialBottomTabNavigator} from '@react-navigation/material-bottom-tabs';
import {AppIcon} from '../../Icons/AppIcon';
import {useUserNotificationData} from '../../Context/Contexts/UserNotificationDataContext';
import {NavigatorScreenParams, useNavigation} from '@react-navigation/native';
import {SeamailStack, SeamailStackParamList} from '../Stacks/SeamailStack';
import {BottomTabComponents} from '../../../libraries/Enums/Navigation';
import {BottomTabNavigationProp} from '@react-navigation/bottom-tabs';
import {AppIcons} from '../../../libraries/Enums/Icons';
import {MainStack, MainStackParamList} from '../Stacks/MainStack';
import {EventStackNavigator, EventStackParamList} from '../Stacks/EventStackNavigator';
import {LfgStackNavigator, LfgStackParamList} from '../Stacks/LFGStackNavigator';
import {ForumStackNavigator, ForumStackParamList} from '../Stacks/ForumStackNavigator';

function getBadgeDisplayValue(input: number | undefined) {
  if (input === 0) {
    return undefined;
  }
  return input;
}

/**
 * This is where we define the root tabs and associate each one with its relevant
 * navigation param list.
 */
export type BottomTabParamList = {
  HomeTab: NavigatorScreenParams<MainStackParamList>;
  SeamailTab: NavigatorScreenParams<SeamailStackParamList>;
  ScheduleTab: NavigatorScreenParams<EventStackParamList>;
  ForumsTab: NavigatorScreenParams<ForumStackParamList>;
  LfgTab: NavigatorScreenParams<LfgStackParamList>;
};

export const BottomTabNavigator = () => {
  const {userNotificationData} = useUserNotificationData();
  const Tab = createMaterialBottomTabNavigator<BottomTabParamList>();

  function getIcon(icon: string) {
    return <AppIcon icon={icon} />;
  }

  const getChatBadgeCount = () => {
    let count = userNotificationData?.newSeamailMessageCount || 0;
    if (userNotificationData?.moderatorData?.newModeratorSeamailMessageCount) {
      count += userNotificationData.moderatorData.newModeratorSeamailMessageCount;
    }
    if (userNotificationData?.moderatorData?.newTTSeamailMessageCount) {
      count += userNotificationData.moderatorData.newTTSeamailMessageCount;
    }
    return count;
  };

  return (
    <Tab.Navigator initialRouteName={BottomTabComponents.homeTab} backBehavior={'history'}>
      <Tab.Screen
        name={BottomTabComponents.homeTab}
        component={MainStack}
        options={{
          title: 'Today',
          tabBarIcon: () => getIcon('home-account'),
          tabBarBadge: getBadgeDisplayValue(userNotificationData?.newAnnouncementCount),
        }}
      />
      <Tab.Screen
        name={BottomTabComponents.seamailTab}
        component={SeamailStack}
        options={{
          title: 'Chat',
          tabBarIcon: () => getIcon('email'),
          tabBarBadge: getBadgeDisplayValue(getChatBadgeCount()),
        }}
      />
      <Tab.Screen
        name={BottomTabComponents.forumsTab}
        component={ForumStackNavigator}
        options={{
          title: 'Forums',
          tabBarIcon: () => getIcon(AppIcons.forum),
          tabBarBadge: getBadgeDisplayValue(userNotificationData?.newForumMentionCount),
        }}
      />
      <Tab.Screen
        name={BottomTabComponents.lfgTab}
        component={LfgStackNavigator}
        options={{
          title: 'LFG',
          tabBarIcon: () => getIcon(AppIcons.lfg),
          tabBarBadge: getBadgeDisplayValue(userNotificationData?.newFezMessageCount),
        }}
      />
      <Tab.Screen
        name={BottomTabComponents.scheduleTab}
        component={EventStackNavigator}
        options={{
          title: 'Events',
          tabBarIcon: () => getIcon(AppIcons.events),
        }}
      />
    </Tab.Navigator>
  );
};

export const useBottomTabNavigator = () => useNavigation<BottomTabNavigationProp<BottomTabParamList>>();
