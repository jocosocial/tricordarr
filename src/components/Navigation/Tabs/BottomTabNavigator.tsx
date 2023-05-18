import React from 'react';
import {createMaterialBottomTabNavigator} from '@react-navigation/material-bottom-tabs';
import {SettingsStack, SettingsStackParamList} from '../Stacks/SettingsStack';
import {MainView} from '../../Views/Static/MainView';
import {AppIcon} from '../../Images/AppIcon';
import {useUserNotificationData} from '../../Context/Contexts/UserNotificationDataContext';
import {TwitarrView} from '../../Views/TwitarrView';
import {handleEvent} from '../../../libraries/Events';
import notifee from '@notifee/react-native';
import {NavigatorScreenParams, useLinkTo} from '@react-navigation/native';
import {Linking} from 'react-native';
import {SeamailStack, SeamailStackParamList} from '../Stacks/SeamailStack';
import {SiteUIStackStack} from '../Stacks/SiteUIStack';
import {BottomTabComponents} from '../../../libraries/Enums/Navigation';

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
  HomeTab: undefined;
  SeamailTab: NavigatorScreenParams<SeamailStackParamList>;
  TwitarrTab: undefined;
  SettingsTab: NavigatorScreenParams<SettingsStackParamList>;
};

export const BottomTabNavigator = () => {
  const {userNotificationData} = useUserNotificationData();
  const linkTo = useLinkTo();
  const Tab = createMaterialBottomTabNavigator<BottomTabParamList>();

  notifee.onForegroundEvent(async ({type, detail}) => {
    const {notification, pressAction} = detail;
    const url = handleEvent(type, notification, pressAction);

    if (typeof url === 'undefined') {
      return;
    }

    linkTo(url);
  });

  notifee.onBackgroundEvent(async ({type, detail}) => {
    const {notification, pressAction} = detail;
    const url = handleEvent(type, notification, pressAction) || 'tricordarr://hometab';

    await Linking.openURL(`tricordarr:/${url}`); // url starts with a /, so only add one
  });

  function getIcon(icon: string) {
    return <AppIcon icon={icon} />;
  }

  return (
    <Tab.Navigator initialRouteName={BottomTabComponents.homeTab}>
      <Tab.Screen
        name={BottomTabComponents.homeTab}
        component={MainView}
        options={{
          title: 'Home',
          tabBarIcon: () => getIcon('home-account'),
        }}
      />
      <Tab.Screen
        name={BottomTabComponents.seamailTab}
        component={SeamailStack}
        options={{
          title: 'Seamail',
          tabBarIcon: () => getIcon('email'),
          tabBarBadge: getBadgeDisplayValue(userNotificationData.newSeamailMessageCount),
        }}
      />
      <Tab.Screen
        name={BottomTabComponents.twitarrTab}
        component={SiteUIStackStack}
        options={{
          title: 'Twit-arr',
          tabBarIcon: () => getIcon('web'),
        }}
      />
      <Tab.Screen
        name={BottomTabComponents.settingsTab}
        component={SettingsStack}
        options={{
          title: 'Settings',
          tabBarIcon: () => getIcon('cog'),
        }}
      />
    </Tab.Navigator>
  );
};
