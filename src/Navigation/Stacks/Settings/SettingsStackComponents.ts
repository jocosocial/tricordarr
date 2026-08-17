import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';

import {CommonStackParamList} from '#src/Navigation/Stacks/Common/CommonStackComponents';

export type SettingsStackParamList = CommonStackParamList & {
  SettingsScreen: undefined;
  BackgroundConnectionSettingsScreen: undefined;
  TestNotificationScreen: undefined;
  TestErrorScreen: undefined;
  SocketSettingsScreen: undefined;
  PushNotificationSettingsScreen: {
    notificationType?: string;
  };
  OobeSettingsScreen: undefined;
  ChangePasswordScreen: undefined;
  ChangeUsernameScreen: undefined;
  AccountManagementScreen: undefined;
  LoginScreen: undefined;
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
  SessionSettingsScreen: undefined;
  SessionDetailsScreen: {
    sessionID: string;
  };
  LoggingSettingsScreen: undefined;
};

export enum SettingsStackScreenComponents {
  settings = 'SettingsScreen',
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
  featureSettingsScreen = 'FeatureSettingsScreen',
  notificationPollerSettingsScreen = 'NotificationPollerSettingsScreen',
  loadingSettingScreen = 'LoadingSettingScreen',
  registerScreen = 'RegisterScreen',
  cruiseSettingsScreen = 'CruiseSettingsScreen',
  accountInfoSettingsScreen = 'UserInfoSettingsScreen',
  aboutSettingsScreen = 'AboutSettingsScreen',
  querySettingsScreen = 'QuerySettingsScreen',
  queryKeysSettingsScreen = 'QueryKeysSettingsScreen',
  queryDataSettingsScreen = 'QueryDataSettingsScreen',
  timeSettingsScreen = 'TimeSettingsScreen',
  sessionSettings = 'SessionSettingsScreen',
  sessionDetails = 'SessionDetailsScreen',
  loggingSettings = 'LoggingSettingsScreen',
}

export const useSettingsStack = () => useNavigation<StackNavigationProp<SettingsStackParamList>>();
