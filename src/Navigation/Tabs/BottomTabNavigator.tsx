import {type BottomTabBarProps, BottomTabNavigationProp, createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {NavigatorScreenParams, useNavigation} from '@react-navigation/native';
import React, {useCallback} from 'react';

import {AppIcon} from '#src/Components/Icons/AppIcon';
import {AppBottomTabBar} from '#src/Components/Navigation/AppBottomTabBar';
import {AppIcons} from '#src/Enums/Icons';
import {getBadgeDisplayValue} from '#src/Libraries/StringUtils';
import {ChatStackNavigator, ChatStackParamList} from '#src/Navigation/Stacks/ChatStackNavigator';
import {ForumStackNavigator, ForumStackParamList} from '#src/Navigation/Stacks/ForumStackNavigator';
import {LfgStackNavigator, LfgStackParamList} from '#src/Navigation/Stacks/LFGStackNavigator';
import {MainStackNavigator, MainStackParamList} from '#src/Navigation/Stacks/MainStackNavigator';
import {ScheduleStackNavigator, ScheduleStackParamList} from '#src/Navigation/Stacks/ScheduleStackNavigator';
import {useUserNotificationDataQuery} from '#src/Queries/Alert/NotificationQueries';

/**
 * This is where we define the root tabs and associate each one with its relevant
 * navigation param list.
 */
export type BottomTabParamList = {
  HomeTab: NavigatorScreenParams<MainStackParamList>;
  SeamailTab: NavigatorScreenParams<ChatStackParamList>;
  ScheduleTab: NavigatorScreenParams<ScheduleStackParamList>;
  ForumsTab: NavigatorScreenParams<ForumStackParamList>;
  LfgTab: NavigatorScreenParams<LfgStackParamList>;
};

export enum BottomTabComponents {
  homeTab = 'HomeTab',
  seamailTab = 'SeamailTab',
  forumsTab = 'ForumsTab',
  scheduleTab = 'ScheduleTab',
  lfgTab = 'LfgTab',
}

export const BottomTabNavigator = () => {
  const {data: userNotificationData} = useUserNotificationDataQuery({enabled: false});
  const Tab = createBottomTabNavigator<BottomTabParamList>();

  const getIcon = useCallback((icon: string) => {
    return <AppIcon icon={icon} />;
  }, []);

  const getChatBadgeCount = useCallback(() => {
    let count = userNotificationData?.newSeamailMessageCount || 0;
    if (userNotificationData?.moderatorData?.newModeratorSeamailMessageCount) {
      count += userNotificationData.moderatorData.newModeratorSeamailMessageCount;
    }
    if (userNotificationData?.moderatorData?.newTTSeamailMessageCount) {
      count += userNotificationData.moderatorData.newTTSeamailMessageCount;
    }
    return count;
  }, [userNotificationData]);

  const getForumBadgeCount = useCallback(() => {
    let count = userNotificationData?.newForumMentionCount || 0;
    userNotificationData?.alertWords.map(alertData => {
      count += alertData.newForumMentionCount;
    });
    return count;
  }, [userNotificationData]);

  const tabBar = useCallback((props: BottomTabBarProps) => {
    return <AppBottomTabBar {...props} />;
  }, []);

  return (
    <Tab.Navigator
      initialRouteName={BottomTabComponents.homeTab}
      backBehavior={'history'}
      tabBar={tabBar}
      screenOptions={{headerShown: false}}>
      <Tab.Screen
        name={BottomTabComponents.homeTab}
        component={MainStackNavigator}
        options={{
          title: 'Today',
          tabBarIcon: ({focused}) => getIcon(focused ? AppIcons.homeActive : AppIcons.home),
          tabBarBadge: getBadgeDisplayValue(userNotificationData?.newAnnouncementCount),
        }}
      />
      <Tab.Screen
        name={BottomTabComponents.forumsTab}
        component={ForumStackNavigator}
        options={{
          title: 'Forums',
          tabBarIcon: ({focused}) => getIcon(focused ? AppIcons.forumActive : AppIcons.forum),
          tabBarBadge: getBadgeDisplayValue(getForumBadgeCount()),
        }}
      />
      <Tab.Screen
        name={BottomTabComponents.seamailTab}
        component={ChatStackNavigator}
        options={{
          title: 'Seamail',
          tabBarIcon: ({focused}) => getIcon(focused ? AppIcons.seamailActive : AppIcons.seamail),
          tabBarBadge: getBadgeDisplayValue(getChatBadgeCount()),
        }}
      />
      <Tab.Screen
        name={BottomTabComponents.lfgTab}
        component={LfgStackNavigator}
        options={{
          title: 'LFG',
          tabBarIcon: ({focused}) => getIcon(focused ? AppIcons.lfgActive : AppIcons.lfg),
          tabBarBadge: getBadgeDisplayValue(userNotificationData?.newFezMessageCount),
        }}
      />
      <Tab.Screen
        name={BottomTabComponents.scheduleTab}
        component={ScheduleStackNavigator}
        options={{
          title: 'Schedule',
          tabBarIcon: ({focused}) => getIcon(focused ? AppIcons.eventsActive : AppIcons.events),
          tabBarBadge: getBadgeDisplayValue(userNotificationData?.newPrivateEventMessageCount),
        }}
      />
    </Tab.Navigator>
  );
};

export const useBottomTabNavigator = () => useNavigation<BottomTabNavigationProp<BottomTabParamList>>();
