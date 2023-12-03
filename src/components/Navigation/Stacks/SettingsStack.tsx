import React from 'react';
import {createNativeStackNavigator, NativeStackNavigationProp} from '@react-navigation/native-stack';
import {NetworkInfoSettings} from '../../Screens/Settings/Developer/NetworkInfoSettings';
import {ServerConnectionSettings} from '../../Screens/Settings/Notifications/ServerConnectionSettings';
import {SettingsScreen} from '../../Screens/Settings/Developer/SettingsScreen';
import {TestNotificationScreen} from '../../Screens/Settings/Developer/TestNotificationScreen';
import {NavigatorIDs, SettingsStackScreenComponents} from '../../../libraries/Enums/Navigation';
import {TestErrorScreen} from '../../Screens/Settings/Developer/TestErrorScreen';
import {useNavigation} from '@react-navigation/native';
import {useStyles} from '../../Context/Contexts/StyleContext';
import {ConfigServerUrlScreen} from '../../Screens/Settings/Config/ConfigServerUrlScreen';
import {SocketSettingsScreen} from '../../Screens/Settings/SocketSettingsScreen';
import {PushNotificationSettingsScreen} from '../../Screens/Settings/Notifications/PushNotificationSettingsScreen';
import {OobeSettingsScreen} from '../../Screens/Settings/Developer/OobeSettingsScreen';
import {ChangeUsernameScreen} from '../../Screens/Settings/Account/ChangeUsernameScreen';
import {ChangePasswordScreen} from '../../Screens/Settings/Account/ChangePasswordScreen';
import {AlertKeywordsSettingsScreen} from '../../Screens/Settings/Content/AlertKeywordsSettingsScreen';
import {MuteKeywordsSettingsScreen} from '../../Screens/Settings/Content/MuteKeywordsSettingsScreen';
import {AccountManagementScreen} from '../../Screens/Settings/Account/AccountManagementScreen';
import {LoginScreen} from '../../Screens/Settings/Account/LoginScreen';
import {BlockUsersScreen} from '../../Screens/User/BlockUsersScreen';
import {MuteUsersScreen} from '../../Screens/User/MuteUsersScreen';
import {FavoriteUsersScreen} from '../../Screens/User/FavoriteUsersScreen';
import {EventSettingsScreen} from '../../Screens/Event/EventSettingsScreen';
import {LfgSettingsScreen} from '../../Screens/LFG/LfgSettingsScreen';
import {FeatureSettingsScreen} from '../../Screens/Settings/Developer/FeatureSettingsScreen';
import {NotificationPollerSettingsScreen} from '../../Screens/Settings/Notifications/NotificationPollerSettingsScreen';
import {LoadingSettingScreen} from '../../Screens/Settings/Developer/LoadingSettingScreen';
import {RegisterScreen} from '../../Screens/Settings/Account/RegisterScreen';
import {CruiseSettingsScreen} from '../../Screens/Settings/Developer/CruiseSettingsScreen';

export type SettingsStackParamList = {
  SettingsScreen: undefined;
  NetworkInfoSettingsScreen: undefined;
  ServerConnectionSettingsScreen: undefined;
  TestNotificationScreen: undefined;
  TestErrorScreen: undefined;
  ConfigServerUrlScreen: undefined;
  SocketSettingsScreen: undefined;
  PushNotificationSettingsScreen: undefined;
  OobeSettingsScreen: undefined;
  ChangePasswordScreen: undefined;
  ChangeUsernameScreen: undefined;
  AlertKeywordsSettingsScreen: undefined;
  MuteKeywordsSettingsScreen: undefined;
  AccountManagementScreen: undefined;
  LoginScreen: undefined;
  BlockUsersScreen: undefined;
  MuteUsersScreen: undefined;
  FavoriteUsersScreen: undefined;
  EventSettingsScreen: undefined;
  LfgSettingsScreen: undefined;
  FeatureSettingsScreen: undefined;
  NotificationPollerSettingsScreen: undefined;
  LoadingSettingScreen: undefined;
  RegisterScreen: undefined;
  CruiseSettingsScreen: undefined;
};

export const SettingsStack = () => {
  const {screenOptions} = useStyles();
  const Stack = createNativeStackNavigator<SettingsStackParamList>();

  // We don't put the title in the various Screens because we define it in the NavigationListItem
  // so we're always consistent between setting name and header title.
  return (
    <Stack.Navigator
      id={NavigatorIDs.settingsStack}
      initialRouteName={SettingsStackScreenComponents.settings}
      screenOptions={screenOptions}>
      <Stack.Screen
        name={SettingsStackScreenComponents.settings}
        component={SettingsScreen}
        options={{title: 'Settings'}}
      />
      <Stack.Screen name={SettingsStackScreenComponents.networkInfoSettings} component={NetworkInfoSettings} />
      <Stack.Screen
        name={SettingsStackScreenComponents.serverConnectionSettings}
        component={ServerConnectionSettings}
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
        name={SettingsStackScreenComponents.configServerUrl}
        component={ConfigServerUrlScreen}
        options={{title: 'Server URL'}}
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
      <Stack.Screen
        name={SettingsStackScreenComponents.alertKeywords}
        component={AlertKeywordsSettingsScreen}
        options={{title: 'Alert Keywords'}}
      />
      <Stack.Screen
        name={SettingsStackScreenComponents.muteKeywords}
        component={MuteKeywordsSettingsScreen}
        options={{title: 'Mute Keywords'}}
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
        name={SettingsStackScreenComponents.blockUsers}
        component={BlockUsersScreen}
        options={{title: 'Blocked Users'}}
      />
      <Stack.Screen
        name={SettingsStackScreenComponents.muteUsers}
        component={MuteUsersScreen}
        options={{title: 'Muted Users'}}
      />
      <Stack.Screen
        name={SettingsStackScreenComponents.favoriteUsers}
        component={FavoriteUsersScreen}
        options={{title: 'Favorite Users'}}
      />
      <Stack.Screen
        name={SettingsStackScreenComponents.eventSettings}
        component={EventSettingsScreen}
        options={{title: 'Event Settings'}}
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
    </Stack.Navigator>
  );
};

export const useSettingsStack = () => useNavigation<NativeStackNavigationProp<SettingsStackParamList>>();
