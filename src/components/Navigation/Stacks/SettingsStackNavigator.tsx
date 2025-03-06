import React from 'react';
import {createNativeStackNavigator, NativeStackNavigationProp} from '@react-navigation/native-stack';
import {NetworkInfoSettings} from '../../Screens/Settings/Developer/NetworkInfoSettings';
import {ServerConnectionSettingsScreen} from '../../Screens/Settings/Notifications/ServerConnectionSettingsScreen.tsx';
import {SettingsScreen} from '../../Screens/Settings/SettingsScreen';
import {TestNotificationScreen} from '../../Screens/Settings/Developer/TestNotificationScreen';
import {TestErrorScreen} from '../../Screens/Settings/Developer/TestErrorScreen';
import {useNavigation} from '@react-navigation/native';
import {useStyles} from '../../Context/Contexts/StyleContext';
import {SocketSettingsScreen} from '../../Screens/Settings/SocketSettingsScreen';
import {PushNotificationSettingsScreen} from '../../Screens/Settings/Notifications/PushNotificationSettingsScreen';
import {OobeSettingsScreen} from '../../Screens/Settings/Developer/OobeSettingsScreen';
import {ChangeUsernameScreen} from '../../Screens/Settings/Account/ChangeUsernameScreen';
import {ChangePasswordScreen} from '../../Screens/Settings/Account/ChangePasswordScreen';
import {AccountManagementScreen} from '../../Screens/Settings/Account/AccountManagementScreen';
import {LoginScreen} from '../../Screens/Settings/Account/LoginScreen';
import {EventSettingsScreen} from '../../Screens/Event/EventSettingsScreen';
import {LfgSettingsScreen} from '../../Screens/LFG/LfgSettingsScreen';
import {FeatureSettingsScreen} from '../../Screens/Settings/Developer/FeatureSettingsScreen';
import {NotificationPollerSettingsScreen} from '../../Screens/Settings/Notifications/NotificationPollerSettingsScreen';
import {LoadingSettingScreen} from '../../Screens/Settings/Developer/LoadingSettingScreen';
import {RegisterScreen} from '../../Screens/Settings/Account/RegisterScreen';
import {CruiseSettingsScreen} from '../../Screens/Settings/Developer/CruiseSettingsScreen';
import {UserInfoSettingsScreen} from '../../Screens/Settings/Developer/UserInfoSettingsScreen';
import {AboutSettingsScreen} from '../../Screens/Settings/AboutSettingsScreen';
import {QuerySettingsScreen} from '../../Screens/Settings/Developer/QuerySettingsScreen';
import {CommonStackParamList} from '../CommonScreens';
import {QueryKeysSettingsScreen} from '../../Screens/Settings/Developer/QueryKeysSettingsScreen.tsx';
import {QueryDataSettingsScreen} from '../../Screens/Settings/Developer/QueryDataSettingsScreen.tsx';
import {TimeSettingsScreen} from '../../Screens/Settings/Config/TimeSettingsScreen.tsx';

export type SettingsStackParamList = CommonStackParamList & {
  SettingsScreen: undefined;
  NetworkInfoSettingsScreen: undefined;
  ServerConnectionSettingsScreen: undefined;
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
  serverConnectionSettings = 'ServerConnectionSettingsScreen',
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
        name={SettingsStackScreenComponents.serverConnectionSettings}
        component={ServerConnectionSettingsScreen}
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
        options={{title: 'Disabled Features'}}
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
