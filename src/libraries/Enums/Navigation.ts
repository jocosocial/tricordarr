/**
 * These are used for Navigation TypeScript checking.
 * https://reactnavigation.org/docs/typescript/
 *
 * @TODO start moving these out to the various navigators
 * @TODO kill the navigatorIDs. THey aren't necessary.
 */
export enum NavigatorIDs {
  settingsStack = 'SettingsStackNavigator',
  mainStack = 'MainStack',
  oobeStack = 'OobeStackNavigator',
  eventStack = 'EventStackNavigator',
  lfgStack = 'LfgStackNavigator',
  forumStack = 'ForumStackNavigator',
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
  socketSettings = 'SocketSettingsScreen',
  pushNotificationSettings = 'PushNotificationSettingsScreen',
  oobeSettings = 'OobeSettingsScreen',
  changePassword = 'ChangePasswordScreen',
  changeUsername = 'ChangeUsernameScreen',
  login = 'LoginScreen',
  accountManagement = 'AccountManagementScreen',
  blockUsers = 'BlockUsersScreen',
  muteUsers = 'MuteUsersScreen',
  favoriteUsers = 'FavoriteUsersScreen',
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
}

export enum ChatStackScreenComponents {
  seamailListScreen = 'SeamailListScreen',
  krakentalkCreateScreen = 'KrakenTalkCreateScreen',
  seamailSearchScreen = 'SeamailSearchScreen',
  seamailHelpScreen = 'SeamailHelpScreen',
  krakenTalkReceiveScreen = 'KrakenTalkReceiveScreen',
}

export enum MainStackComponents {
  mainScreen = 'MainScreen',
  mainSettingsScreen = 'MainSettingsScreen',
  aboutScreen = 'AboutScreen',
  userDirectoryScreen = 'UserDirectoryScreen',
  dailyThemeScreen = 'DailyThemeScreen',
  mainHelpScreen = 'MainHelpScreen',
  conductScreen = 'MainConductScreen',
  dailyThemesScreen = 'DailyThemesScreen',
  photostreamScreen = 'PhotostreamScreen',
  photostreamImageCreateScreen = 'PhotostreamImageCreateScreen',
  photostreamHelpScreen = 'PhotostreamHelpScreen',
}

export enum OobeStackComponents {
  oobeWelcomeScreen = 'OobeWelcomeScreen',
  oobeServerScreen = 'OobeServerScreen',
  oobeConductScreen = 'OobeConductScreen',
  oobeAccountScreen = 'OobeAccountScreen',
  oobeRegisterScreen = 'RegisterScreen',
  oobeFinishScreen = 'OobeFinishScreen',
  oobeLoginScreen = 'LoginScreen',
  oobeNotificationsScreen = 'OobeNotificationsScreen',
}

export enum EventStackComponents {
  eventDayScreen = 'EventDayScreen',
  eventSearchScreen = 'EventSearchScreen',
  eventSettingsScreen = 'EventSettingsScreen',
  eventHelpScreen = 'EventHelpScreen',
  eventFavoritesScreen = 'EventFavoritesScreen',
  eventYourDayScreen = 'EventYourDayScreen',
}

export enum LfgStackComponents {
  lfgOwnedScreen = 'LfgOwnedScreen',
  lfgHelpScreen = 'LfgHelpScreen',
  lfgJoinedScreen = 'LfgJoinedScreen',
  lfgFindScreen = 'LfgFindScreen',
  lfgSettingsScreen = 'LfgSettingsScreen',
  lfgCreateScreen = 'LfgCreateScreen',
}

export enum ForumStackComponents {
  forumCategoriesScreen = 'ForumCategoriesScreen',
  forumCategoryScreen = 'ForumCategoryScreen',
  forumPostMentionScreen = 'ForumPostMentionScreen',
  forumPostSelfScreen = 'ForumPostSelfScreen',
  forumPostFavoriteScreen = 'ForumPostFavoriteScreen',
  forumFavoritesScreen = 'ForumFavoritesScreen',
  forumMutesScreen = 'ForumMutesScreen',
  forumOwnedScreen = 'ForumOwnedScreen',
  forumRecentScreen = 'ForumRecentScreen',
  forumPostSearchScreen = 'ForumPostSearchScreen',
  forumThreadSearchScreen = 'ForumThreadSearchScreen',
  forumThreadCreateScreen = 'ForumThreadCreateScreen',
  forumPostAlertwordScreen = 'ForumPostAlertwordScreen',
}
