import {useNavigation} from '@react-navigation/native';
import {createNativeStackNavigator, NativeStackNavigationProp} from '@react-navigation/native-stack';
import React from 'react';

import {useStyles} from '#src/Context/Contexts/StyleContext';
import {CommonStackParamList} from '#src/Navigation/CommonScreens';
import {EventSettingsScreen} from '#src/Screens/Event/EventSettingsScreen';
import {LfgSettingsScreen} from '#src/Screens/LFG/LfgSettingsScreen';
import {AboutSettingsScreen} from '#src/Screens/Settings/AboutSettingsScreen';
import {AccountManagementScreen} from '#src/Screens/Settings/Account/AccountManagementScreen';
import {ChangePasswordScreen} from '#src/Screens/Settings/Account/ChangePasswordScreen';
import {ChangeUsernameScreen} from '#src/Screens/Settings/Account/ChangeUsernameScreen';
import {LoginScreen} from '#src/Screens/Settings/Account/LoginScreen';
import {RegisterScreen} from '#src/Screens/Settings/Account/RegisterScreen';
import {TimeSettingsScreen} from '#src/Screens/Settings/Config/TimeSettingsScreen';
import {CruiseSettingsScreen} from '#src/Screens/Settings/Developer/CruiseSettingsScreen';
import {FeatureSettingsScreen} from '#src/Screens/Settings/Developer/FeatureSettingsScreen';
import {LoadingSettingScreen} from '#src/Screens/Settings/Developer/LoadingSettingScreen';
import {NetworkInfoSettings} from '#src/Screens/Settings/Developer/NetworkInfoSettings';
import {OobeSettingsScreen} from '#src/Screens/Settings/Developer/OobeSettingsScreen';
import {QueryDataSettingsScreen} from '#src/Screens/Settings/Developer/QueryDataSettingsScreen';
import {QueryKeysSettingsScreen} from '#src/Screens/Settings/Developer/QueryKeysSettingsScreen';
import {QuerySettingsScreen} from '#src/Screens/Settings/Developer/QuerySettingsScreen';
import {TestErrorScreen} from '#src/Screens/Settings/Developer/TestErrorScreen';
import {TestNotificationScreen} from '#src/Screens/Settings/Developer/TestNotificationScreen';
import {UserInfoSettingsScreen} from '#src/Screens/Settings/Developer/UserInfoSettingsScreen';
import {BackgroundConnectionSettingsScreen} from '#src/Screens/Settings/Notifications/BackgroundConnectionSettingsScreen';
import {NotificationPollerSettingsScreen} from '#src/Screens/Settings/Notifications/NotificationPollerSettingsScreen';
import {PushNotificationSettingsScreen} from '#src/Screens/Settings/Notifications/PushNotificationSettingsScreen';
import {SettingsScreen} from '#src/Screens/Settings/SettingsScreen';
import {SocketSettingsScreen} from '#src/Screens/Settings/SocketSettingsScreen';

export type SettingsStackParamList = CommonStackParamList & {
  SettingsScreen: undefined;
  NetworkInfoSettingsScreen: undefined;
  BackgroundConnectionSettingsScreen: undefined;
  TestNotificationScreen: undefined;
  TestErrorScreen: undefined;
  SocketSettingsScreen: undefined;
  PushNotificationSettingsScreen: undefined;
  OobeSettingsScreen: undefined;
  ChangePasswordScreen: undefined;
  ChangeUsernameScreen: undefined;
  AccountManagementScreen: undefined;
  LoginScreen: undefined;
  EventSettingsScreen: undefined;
  LfgSettingsScreen: undefined;
  FeatureSettingsScreen: undefined;
  NotificationPollerSettingsScreen: undefined;
  LoadingSettingScreen: undefined;
  RegisterScreen: undefined;
  CruiseSettingsScreen: undefined;
  UserInfoSettingsScreen: undefined;
  AboutSettingsScreen: undefined;
  QuerySettingsScreen: undefined;
  QueryKeysSettingsScreen: undefined;
  QueryDataSettingsScreen: {
    queryHash: string;
  };
  TimeSettingsScreen: undefined;
};

export enum SettingsStackScreenComponents {
  settings = 'SettingsScreen',
  networkInfoSettings = 'NetworkInfoSettingsScreen',
  backgroundConnectionSettings = 'BackgroundConnectionSettingsScreen',
  testNotification = 'TestNotificationScreen',
  testError = 'TestErrorScreen',
  socketSettings = 'SocketSettingsScreen',
  pushNotificationSettings = 'PushNotificationSettingsScreen',
  oobeSettings = 'OobeSettingsScreen',
  changePassword = 'ChangePasswordScreen',
  changeUsername = 'ChangeUsernameScreen',
  login = 'LoginScreen',
  accountManagement = 'AccountManagementScreen',
  eventSettings = 'EventSettingsScreen',
  lfgSettings = 'LfgSettingsScreen',
  featureSettingsScreen = 'FeatureSettingsScreen',
  notificationPollerSettingsScreen = 'NotificationPollerSettingsScreen',
  loadingSettingScreen = 'LoadingSettingScreen',
  registerScreen = 'RegisterScreen',
  cruiseSettingsScreen = 'CruiseSettingsScreen',
  userInfoSettingsScreen = 'UserInfoSettingsScreen',
  aboutSettingsScreen = 'AboutSettingsScreen',
  querySettingsScreen = 'QuerySettingsScreen',
  queryKeysSettingsScreen = 'QueryKeysSettingsScreen',
  queryDataSettingsScreen = 'QueryDataSettingsScreen',
  timeSettingsScreen = 'TimeSettingsScreen',
}

export const SettingsStackNavigator = () => {
  const {screenOptions} = useStyles();
  const Stack = createNativeStackNavigator<SettingsStackParamList>();

  // We don't put the title in the various Screens because we define it in the NavigationListItem
  // so we're always consistent between setting name and header title.
  return (
    <Stack.Navigator initialRouteName={SettingsStackScreenComponents.settings} screenOptions={screenOptions}>
      <Stack.Screen
        name={SettingsStackScreenComponents.settings}
        component={SettingsScreen}
        options={{title: 'Settings'}}
      />
      <Stack.Screen
        name={SettingsStackScreenComponents.networkInfoSettings}
        component={NetworkInfoSettings}
        options={{title: 'Network'}}
      />
      <Stack.Screen
        name={SettingsStackScreenComponents.backgroundConnectionSettings}
        component={BackgroundConnectionSettingsScreen}
        options={{title: 'Background Connection'}}
      />
      <Stack.Screen
        name={SettingsStackScreenComponents.testNotification}
        component={TestNotificationScreen}
        options={{title: 'Test Notification'}}
      />
      <Stack.Screen
        name={SettingsStackScreenComponents.testError}
        component={TestErrorScreen}
        options={{title: 'Test Errors'}}
      />

      <Stack.Screen
        name={SettingsStackScreenComponents.socketSettings}
        component={SocketSettingsScreen}
        options={{title: 'Sockets'}}
      />
      <Stack.Screen
        name={SettingsStackScreenComponents.pushNotificationSettings}
        component={PushNotificationSettingsScreen}
        options={{title: 'Push Notifications'}}
      />
      <Stack.Screen
        name={SettingsStackScreenComponents.oobeSettings}
        component={OobeSettingsScreen}
        options={{title: 'OOBE'}}
      />
      <Stack.Screen
        name={SettingsStackScreenComponents.changeUsername}
        component={ChangeUsernameScreen}
        options={{title: 'Change Username'}}
      />
      <Stack.Screen
        name={SettingsStackScreenComponents.changePassword}
        component={ChangePasswordScreen}
        options={{title: 'Change Password'}}
      />
      <Stack.Screen name={SettingsStackScreenComponents.login} component={LoginScreen} options={{title: 'Login'}} />
      <Stack.Screen
        name={SettingsStackScreenComponents.registerScreen}
        component={RegisterScreen}
        options={{title: 'New Account'}}
      />
      <Stack.Screen
        name={SettingsStackScreenComponents.accountManagement}
        component={AccountManagementScreen}
        options={{title: 'Account Management'}}
      />
      <Stack.Screen
        name={SettingsStackScreenComponents.eventSettings}
        component={EventSettingsScreen}
        options={{title: 'Schedule Settings'}}
      />
      <Stack.Screen
        name={SettingsStackScreenComponents.lfgSettings}
        component={LfgSettingsScreen}
        options={{title: 'LFG Settings'}}
      />
      <Stack.Screen
        name={SettingsStackScreenComponents.featureSettingsScreen}
        component={FeatureSettingsScreen}
        options={{title: 'Manage Features'}}
      />
      <Stack.Screen
        name={SettingsStackScreenComponents.notificationPollerSettingsScreen}
        component={NotificationPollerSettingsScreen}
        options={{title: 'Notification Polling'}}
      />
      <Stack.Screen
        name={SettingsStackScreenComponents.loadingSettingScreen}
        component={LoadingSettingScreen}
        options={{title: 'Loading'}}
      />
      <Stack.Screen
        name={SettingsStackScreenComponents.cruiseSettingsScreen}
        component={CruiseSettingsScreen}
        options={{title: 'Cruise Settings'}}
      />
      <Stack.Screen
        name={SettingsStackScreenComponents.userInfoSettingsScreen}
        component={UserInfoSettingsScreen}
        options={{title: 'User Info'}}
      />
      <Stack.Screen
        name={SettingsStackScreenComponents.aboutSettingsScreen}
        component={AboutSettingsScreen}
        options={{title: 'About'}}
      />
      <Stack.Screen
        name={SettingsStackScreenComponents.querySettingsScreen}
        component={QuerySettingsScreen}
        options={{title: 'Query Settings'}}
      />
      <Stack.Screen
        name={SettingsStackScreenComponents.queryKeysSettingsScreen}
        component={QueryKeysSettingsScreen}
        options={{title: 'Query Keys'}}
      />
      <Stack.Screen
        name={SettingsStackScreenComponents.queryDataSettingsScreen}
        component={QueryDataSettingsScreen}
        options={{title: 'Query Data'}}
      />
      <Stack.Screen
        name={SettingsStackScreenComponents.timeSettingsScreen}
        component={TimeSettingsScreen}
        options={{title: 'Time Settings'}}
      />
    </Stack.Navigator>
  );
};

export const useSettingsStack = () => useNavigation<NativeStackNavigationProp<SettingsStackParamList>>();
