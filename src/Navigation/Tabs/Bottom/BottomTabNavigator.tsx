import {type BottomTabBarProps, createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import React, {useCallback} from 'react';

import {AppIcon} from '#src/Components/Icons/AppIcon';
import {AppBottomTabBar} from '#src/Components/Navigation/AppBottomTabBar';
import {AppIcons} from '#src/Enums/Icons';
import {getBadgeDisplayValue} from '#src/Libraries/StringUtils';
import {ChatStackNavigator} from '#src/Navigation/Stacks/Chat/ChatStackNavigator';
import {ForumStackNavigator} from '#src/Navigation/Stacks/Forum/ForumStackNavigator';
import {LfgStackNavigator} from '#src/Navigation/Stacks/Lfg/LfgStackNavigator';
import {MainStackNavigator} from '#src/Navigation/Stacks/Main/MainStackNavigator';
import {ScheduleStackNavigator} from '#src/Navigation/Stacks/Schedule/ScheduleStackNavigator';
import {BottomTabComponents, BottomTabParamList} from '#src/Navigation/Tabs/Bottom/BottomTabComponents';
import {useUserNotificationDataQuery} from '#src/Queries/Alert/NotificationQueries';
import {UserNotificationData} from '#src/Structs/ControllerStructs';

export const BottomTabNavigator = () => {
  const {data: userNotificationData} = useUserNotificationDataQuery({enabled: false});
  const Tab = createBottomTabNavigator<BottomTabParamList>();

  const getIcon = useCallback((icon: string) => {
    return <AppIcon icon={icon} />;
  }, []);

  const getChatBadgeCount = useCallback(() => {
    let count = UserNotificationData.totalNewSeamail(userNotificationData);
    count += UserNotificationData.totalNewLFG(userNotificationData);
    count += UserNotificationData.totalNewPrivateEvent(userNotificationData);
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
      // firstRoute: Back from a non-Today tab root goes to Today instead of exiting.
      backBehavior={'firstRoute'}
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
        }}
      />
    </Tab.Navigator>
  );
};
