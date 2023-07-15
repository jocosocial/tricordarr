/**
 * These are used for Navigation TypeScript checking.
 * https://reactnavigation.org/docs/typescript/
 */
export enum NavigatorIDs {
  settingsStack = 'SettingsStackNavigator',
  seamailStack = 'SeamailStackNavigator',
  userStack = 'UserStack',
  mainStack = 'MainStack',
  rootStack = 'RootStackNavigator',
}

export enum BottomTabComponents {
  homeTab = 'HomeTab',
  seamailTab = 'SeamailTab',
  forumsTab = 'ForumsTab',
  scheduleTab = 'ScheduleTab',
}

export enum SettingsStackScreenComponents {
  settings = 'SettingsScreen',
  networkInfoSettings = 'NetworkInfoSettingsScreen',
  accountSettings = 'AccountSettingsScreen',
  serverConnectionSettings = 'ServerConnectionSettingsScreen',
  testNotification = 'TestNotificationScreen',
  testError = 'TestErrorScreen',
  configServerUrl = 'ConfigServerUrlScreen',
  configShipSSID = 'ConfigShipSSIDScreen',
  socketSettings = 'SocketSettingsScreen',
  pushNotificationSettings = 'PushNotificationSettingsScreen',
  oobeSettings = 'OobeSettingsScreen',
  changePassword = 'ChangePasswordScreen',
  changeUsername = 'ChangeUsernameScreen',
  alertKeywords = 'AlertKeywordsSettingsScreen',
}

export enum SeamailStackScreenComponents {
  seamailListScreen = 'SeamailListScreen',
  seamailScreen = 'SeamailScreen',
  seamailDetailsScreen = 'SeamailDetailsScreen',
  userProfileScreen = 'UserProfileScreen',
  seamailCreateScreen = 'SeamailCreateScreen',
  krakentalkCreateScreen = 'KrakenTalkCreateScreen',
  seamailAddParticipantScreen = 'SeamailAddParticipantScreen',
}

export enum MainStackComponents {
  mainScreen = 'MainScreen',
  siteUIScreen = 'SiteUIScreen',
  mainSettingsScreen = 'MainSettingsScreen',
  aboutScreen = 'AboutScreen',
}

export enum RootStackComponents {
  oobeWelcomeScreen = 'OobeWelcomeScreen',
  rootContentScreen = 'RootContentScreen',
  lighterScreen = 'LighterScreen',
}
