import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';

import {CheckpointPreview} from '#src/Enums/CheckpointPreview';
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
  // serverUrl and username pre-fill the form (add account, sign a revoked account back in).
  LoginScreen: {serverUrl?: string; username?: string} | undefined;
  FeatureSettingsScreen: undefined;
  NotificationPollerSettingsScreen: undefined;
  LoadingSettingScreen: undefined;
  RegisterConductScreen: {serverUrl?: string} | undefined;
  RegisterScreen: {serverUrl?: string} | undefined;
  CruiseSettingsScreen: undefined;
  UserInfoSettingsScreen: undefined;
  AboutSettingsScreen: undefined;
  QuerySettingsScreen: undefined;
  QueryKeysSettingsScreen: undefined;
  QueryDataSettingsScreen: {
    queryHash: string;
  };
  TimeSettingsScreen: undefined;
  AccountsSettingsScreen: undefined;
  SessionDetailsScreen: {
    sessionID: string;
  };
  LoggingSettingsScreen: undefined;
  CheckpointSettingScreen: undefined;
  CheckpointPreviewSettingScreen: {
    preview: CheckpointPreview;
  };
  LogViewerScreen: undefined;
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
  registerConductScreen = 'RegisterConductScreen',
  registerScreen = 'RegisterScreen',
  cruiseSettingsScreen = 'CruiseSettingsScreen',
  accountInfoSettingsScreen = 'UserInfoSettingsScreen',
  aboutSettingsScreen = 'AboutSettingsScreen',
  querySettingsScreen = 'QuerySettingsScreen',
  queryKeysSettingsScreen = 'QueryKeysSettingsScreen',
  queryDataSettingsScreen = 'QueryDataSettingsScreen',
  timeSettingsScreen = 'TimeSettingsScreen',
  accountsSettings = 'AccountsSettingsScreen',
  sessionDetails = 'SessionDetailsScreen',
  loggingSettings = 'LoggingSettingsScreen',
  checkpointSettingScreen = 'CheckpointSettingScreen',
  checkpointPreviewSettingScreen = 'CheckpointPreviewSettingScreen',
  logViewerScreen = 'LogViewerScreen',
}

export const useSettingsStack = () => useNavigation<StackNavigationProp<SettingsStackParamList>>();
