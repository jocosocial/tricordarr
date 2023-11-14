/**
 * These are used for Navigation TypeScript checking.
 * https://reactnavigation.org/docs/typescript/
 */
export enum NavigatorIDs {
  settingsStack = 'SettingsStackNavigator',
  seamailStack = 'SeamailStackNavigator',
  mainStack = 'MainStack',
  rootStack = 'RootStackNavigator',
  oobeStack = 'OobeStackNavigator',
  eventStack = 'EventStackNavigator',
  lfgStack = 'LfgStackNavigator',
}

export enum BottomTabComponents {
  homeTab = 'HomeTab',
  seamailTab = 'SeamailTab',
  forumsTab = 'ForumsTab',
  scheduleTab = 'ScheduleTab',
  lfgTab = 'LfgTab',
}

export enum SettingsStackScreenComponents {
  settings = 'SettingsScreen',
  networkInfoSettings = 'NetworkInfoSettingsScreen',
  serverConnectionSettings = 'ServerConnectionSettingsScreen',
  testNotification = 'TestNotificationScreen',
  testError = 'TestErrorScreen',
  configServerUrl = 'ConfigServerUrlScreen',
  socketSettings = 'SocketSettingsScreen',
  pushNotificationSettings = 'PushNotificationSettingsScreen',
  oobeSettings = 'OobeSettingsScreen',
  changePassword = 'ChangePasswordScreen',
  changeUsername = 'ChangeUsernameScreen',
  alertKeywords = 'AlertKeywordsSettingsScreen',
  muteKeywords = 'MuteKeywordsSettingsScreen',
  login = 'LoginScreen',
  accountManagement = 'AccountManagementScreen',
  blockUsers = 'BlockUsersScreen',
  muteUsers = 'MuteUsersScreen',
  favoriteUsers = 'FavoriteUsersScreen',
  scheduleSettings = 'ScheduleSettingsScreen',
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
  userProfileScreen = 'UserProfileScreen',
  userDirectoryScreen = 'UserDirectoryScreen',
}

export enum RootStackComponents {
  oobeNavigator = 'OobeStackNavigator',
  rootContentScreen = 'RootContentScreen',
  lighterScreen = 'LighterScreen',
}

export enum OobeStackComponents {
  oobeWelcomeScreen = 'OobeWelcomeScreen',
  oobeServerScreen = 'OobeServerScreen',
  oobeConductScreen = 'OobeConductScreen',
  oobeAccountScreen = 'OobeAccountScreen',
  oobeRegisterScreen = 'OobeRegisterScreen',
  oobeFinishScreen = 'OobeFinishScreen',
  oobeLoginScreen = 'LoginScreen',
}

export enum EventStackComponents {
  eventDayScreen = 'EventDayScreen',
  eventSearchScreen = 'EventSearchScreen',
  eventSettingsScreen = 'EventSettingsScreen',
  eventScreen = 'EventScreen',
  eventHelpScreen = 'EventHelpScreen',
  eventFavoritesScreen = 'EventFavoritesScreen',
}

export enum LfgStackComponents {
  lfgOwnedScreen = 'LfgOwnedScreen',
  lfgHelpScreen = 'LfgHelpScreen',
  lfgJoinedScreen = 'LfgJoinedScreen',
  lfgFindScreen = 'LfgFindScreen',
  lfgScreen = 'LfgScreen',
  lfgParticipationScreen = 'LfgParticipationScreen',
  lfgAddParticipantScreen = 'LfgAddParticipantScreen',
  lfgChatScreen = 'LfgChatScreen',
}
