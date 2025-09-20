import {BottomTabNavigationProp} from '@react-navigation/bottom-tabs';
import {createMaterialBottomTabNavigator} from '@react-navigation/material-bottom-tabs';
import {NavigatorScreenParams, useNavigation} from '@react-navigation/native';
import React from 'react';

import {AppIcon} from '#src/Components/Icons/AppIcon';
import {AppIcons} from '#src/Enums/Icons';
import {ChatStackNavigator, ChatStackParamList} from '#src/Navigation/Stacks/ChatStackNavigator';
import {ForumStackNavigator, ForumStackParamList} from '#src/Navigation/Stacks/ForumStackNavigator';
import {LfgStackNavigator, LfgStackParamList} from '#src/Navigation/Stacks/LFGStackNavigator';
import {MainStackNavigator, MainStackParamList} from '#src/Navigation/Stacks/MainStackNavigator';
import {ScheduleStackNavigator, ScheduleStackParamList} from '#src/Navigation/Stacks/ScheduleStackNavigator';
import {useUserNotificationDataQuery} from '#src/Queries/Alert/NotificationQueries';

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

  const getForumBadgeCount = () => {
    let count = userNotificationData?.newForumMentionCount || 0;
    userNotificationData?.alertWords.map(alertData => {
      count += alertData.newForumMentionCount;
    });
    return count;
  };

  return (
    <Tab.Navigator initialRouteName={BottomTabComponents.homeTab} backBehavior={'history'}>
      <Tab.Screen
        name={BottomTabComponents.homeTab}
        component={MainStackNavigator}
        options={{
          title: 'Today',
          tabBarIcon: () => getIcon(AppIcons.home),
          tabBarBadge: getBadgeDisplayValue(userNotificationData?.newAnnouncementCount),
        }}
      />
      <Tab.Screen
        name={BottomTabComponents.forumsTab}
        component={ForumStackNavigator}
        options={{
          title: 'Forums',
          tabBarIcon: () => getIcon(AppIcons.forum),
          tabBarBadge: getBadgeDisplayValue(getForumBadgeCount()),
        }}
      />
      <Tab.Screen
        name={BottomTabComponents.seamailTab}
        component={ChatStackNavigator}
        options={{
          title: 'Seamail',
          tabBarIcon: () => getIcon(AppIcons.seamail),
          tabBarBadge: getBadgeDisplayValue(getChatBadgeCount()),
        }}
      />
      <Tab.Screen
        name={BottomTabComponents.scheduleTab}
        component={ScheduleStackNavigator}
        options={{
          title: 'Schedule',
          tabBarIcon: () => getIcon(AppIcons.events),
          tabBarBadge: getBadgeDisplayValue(userNotificationData?.newPrivateEventMessageCount),
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
    </Tab.Navigator>
  );
};

export const useBottomTabNavigator = () => useNavigation<BottomTabNavigationProp<BottomTabParamList>>();
