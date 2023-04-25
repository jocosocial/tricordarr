/**
 * These are used for Navigation TypeScript checking.
 * https://reactnavigation.org/docs/typescript/
 */
export enum NavigatorIDs {
  settingsStack = 'SettingsStackNavigator',
  seamailStack = 'SeamailStackNavigator',
  userStack = 'UserStack',
}

export enum SettingsStackScreenComponents {
  storageKeySettings = 'StorageKeysSettingsScreen',
  settings = 'SettingsScreen',
  settingDetail = 'SettingDetailScreen',
  networkInfoSettings = 'NetworkInfoSettingsScreen',
  accountSettings = 'AccountSettingsScreen',
  serverConnectionSettings = 'ServerConnectionSettingsScreen',
  testNotification = 'TestNotificationScreen',
  testError = 'TestErrorScreen',
}

export enum SeamailStackScreenComponents {
  seamailListScreen = 'SeamailListScreen',
  seamailScreen = 'SeamailScreen',
  seamailDetailsScreen = 'SeamailDetailsScreen',
  userProfileScreen = 'UserProfileScreen',
  seamailCreateScreen = 'SeamailCreateScreen',
  krakentalkCreateScreen = 'KrakenTalkCreateScreen',
}

