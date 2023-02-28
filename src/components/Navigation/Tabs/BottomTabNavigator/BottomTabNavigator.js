import React from 'react';
import {createMaterialBottomTabNavigator} from '@react-navigation/material-bottom-tabs';
import {SettingsStack} from '../../Stacks/SettingsStack';
import {MainView} from '../../../Views/MainView';
import {NavBarIcon} from './BottomTabIcon';
import {SeamailView} from '../../../Views/Seamail/SeamailView';
import {useUserNotificationData} from '../../../Context/Contexts/UserNotificationDataContext';
import {TwitarrView} from '../../../Views/TwitarrView';
import {handleEvent} from '../../../../libraries/Events';
import notifee from "@notifee/react-native";
import {useLinkTo} from '@react-navigation/native';

const Tab = createMaterialBottomTabNavigator();

function getBadgeDisplayValue(input) {
  if (input === 0) {
    return null;
  }
  return input;
}

export const BottomTabNavigator = () => {
  const {userNotificationData} = useUserNotificationData();
  const linkTo = useLinkTo();

  notifee.onForegroundEvent(async ({type, detail}) => {
    const {notification, pressAction} = detail;
    const url = handleEvent(type, notification, pressAction);

    if(typeof(url) === "undefined") { 
      return;
    }

    linkTo(url);
  });

  notifee.onBackgroundEvent(async ({type, detail}) => {
    const {notification, pressAction} = detail;
    const url = handleEvent(type, notification, pressAction) || "/hometab";

    linkTo(url);
  });

  return (
    <Tab.Navigator initialRouteName={'HomeTab'}>
      <Tab.Screen
        name="HomeTab"
        component={MainView}
        options={{
          title: 'Home',
          tabBarIcon: ({color, size}) => <NavBarIcon icon={'home-account'} size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="SeamailTab"
        component={SeamailView}
        options={{
          title: 'Seamail',
          tabBarIcon: ({color, size}) => <NavBarIcon icon={'email'} size={size} color={color} />,
          tabBarBadge: getBadgeDisplayValue(userNotificationData.newSeamailMessageCount),
        }}
      />
      <Tab.Screen
        name="TwitarrTab"
        component={TwitarrView}
        options={{
          title: 'Twit-arr',
          tabBarIcon: ({color, size}) => <NavBarIcon icon={'web'} size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="SettingsTab"
        component={SettingsStack}
        options={{
          title: 'Settings',
          tabBarIcon: ({color, size}) => <NavBarIcon icon={'cog'} size={size} color={color} />,
        }}
      />
    </Tab.Navigator>
  );
};
