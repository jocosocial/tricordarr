import React, {useState} from 'react';
import {createMaterialBottomTabNavigator} from '@react-navigation/material-bottom-tabs';
import {SettingsStack} from '../../Stacks/SettingsStack';
import {MainView} from '../../../Views/MainView';
import {NavBarIcon} from './BottomTabIcon';
import {SeamailView} from '../../../Views/Seamail/SeamailView';

const Tab = createMaterialBottomTabNavigator();

function getBadgeDisplayValue(input) {
  if (input === 0) {
    return null;
  }
  return input;
}

export const BottomTabNavigator = () => {
  // @TODO make this read from the usernotification context.
  const [seamailUnreadMsg, setSeamailUnreadMsg] = useState(5);
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
          tabBarBadge: getBadgeDisplayValue(seamailUnreadMsg),
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
