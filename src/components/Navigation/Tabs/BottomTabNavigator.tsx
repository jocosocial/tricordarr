import React from 'react';
import {createMaterialBottomTabNavigator} from '@react-navigation/material-bottom-tabs';
import {SettingsStack} from '../Stacks/SettingsStack';
import {MainView} from '../../Views/Static/MainView';
import {AppIcon} from '../../Images/AppIcon';
import {useUserNotificationData} from '../../Context/Contexts/UserNotificationDataContext';
import {TwitarrView} from '../../Views/TwitarrView';
import {handleEvent} from '../../../libraries/Events';
import notifee from '@notifee/react-native';
import {useLinkTo} from '@react-navigation/native';
import {Linking} from 'react-native';
import {SeamailStack} from '../Stacks/SeamailStack';
import {SiteUIStackStack} from '../Stacks/SiteUIStack';

const Tab = createMaterialBottomTabNavigator();

function getBadgeDisplayValue(input: number | undefined) {
  if (input === 0) {
    return undefined;
  }
  return input;
}

export const BottomTabNavigator = () => {
  const {userNotificationData} = useUserNotificationData();
  const linkTo = useLinkTo();

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
    <Tab.Navigator initialRouteName={'HomeTab'}>
      <Tab.Screen
        name="HomeTab"
        component={MainView}
        options={{
          title: 'Home',
          tabBarIcon: () => getIcon('home-account'),
        }}
      />
      <Tab.Screen
        name="SeamailTab"
        component={SeamailStack}
        options={{
          title: 'Seamail',
          tabBarIcon: () => getIcon('email'),
          tabBarBadge: getBadgeDisplayValue(userNotificationData.newSeamailMessageCount),
        }}
      />
      <Tab.Screen
        name="TwitarrTab"
        component={SiteUIStackStack}
        options={{
          title: 'Twit-arr',
          tabBarIcon: () => getIcon('web'),
        }}
      />
      <Tab.Screen
        name="SettingsTab"
        component={SettingsStack}
        options={{
          title: 'Settings',
          tabBarIcon: () => getIcon('cog'),
        }}
      />
    </Tab.Navigator>
  );
};
