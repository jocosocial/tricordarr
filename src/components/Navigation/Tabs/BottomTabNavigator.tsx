import React from 'react';
import {createMaterialBottomTabNavigator} from '@react-navigation/material-bottom-tabs';
import {SettingsStack, SettingsStackParamList} from '../Stacks/SettingsStack';
import {MainView} from '../../Views/Static/MainView';
import {AppIcon} from '../../Images/AppIcon';
import {useUserNotificationData} from '../../Context/Contexts/UserNotificationDataContext';
import {NavigatorScreenParams, useNavigation} from '@react-navigation/native';
import {SeamailStack, SeamailStackParamList} from '../Stacks/SeamailStack';
// import {SiteUIStackStack} from '../Stacks/SiteUIStack';
import {BottomTabComponents} from '../../../libraries/Enums/Navigation';
import {BottomTabNavigationProp} from '@react-navigation/bottom-tabs';
import {AppIcons} from '../../../libraries/Enums/Icons';
import {MainStack, MainStackParamList} from '../Stacks/MainStack';

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
  TwitarrTab: undefined;
  SettingsTab: NavigatorScreenParams<SettingsStackParamList>;
};

export const BottomTabNavigator = () => {
  const {userNotificationData} = useUserNotificationData();
  const Tab = createMaterialBottomTabNavigator<BottomTabParamList>();

  function getIcon(icon: string) {
    return <AppIcon icon={icon} />;
  }

  return (
    <Tab.Navigator initialRouteName={BottomTabComponents.homeTab}>
      <Tab.Screen
        name={BottomTabComponents.homeTab}
        component={MainStack}
        options={{
          title: 'Home',
          tabBarIcon: () => getIcon('home-account'),
        }}
      />
      <Tab.Screen
        name={BottomTabComponents.seamailTab}
        component={SeamailStack}
        options={{
          title: 'Chat',
          tabBarIcon: () => getIcon('email'),
          tabBarBadge: getBadgeDisplayValue(userNotificationData?.newSeamailMessageCount),
        }}
      />
      <Tab.Screen
        name={'Forums'}
        component={SeamailStack}
        options={{
          title: 'Forums',
          tabBarIcon: () => getIcon(AppIcons.forum),
        }}
      />
      <Tab.Screen
        name={'Schedule'}
        component={SeamailStack}
        options={{
          title: 'Schedule',
          tabBarIcon: () => getIcon(AppIcons.events),
        }}
      />
      {/*<Tab.Screen*/}
      {/*  name={BottomTabComponents.twitarrTab}*/}
      {/*  component={SiteUIStackStack}*/}
      {/*  options={{*/}
      {/*    title: 'Twit-arr',*/}
      {/*    tabBarIcon: () => getIcon('web'),*/}
      {/*  }}*/}
      {/*/>*/}
      {/*<Tab.Screen*/}
      {/*  name={BottomTabComponents.settingsTab}*/}
      {/*  component={SettingsStack}*/}
      {/*  options={{*/}
      {/*    title: 'Settings',*/}
      {/*    tabBarIcon: () => getIcon('cog'),*/}
      {/*  }}*/}
      {/*/>*/}
    </Tab.Navigator>
  );
};

export const useBottomTabNavigator = () => useNavigation<BottomTabNavigationProp<BottomTabParamList>>();
