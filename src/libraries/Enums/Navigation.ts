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
  seamailsScreen = 'SeamailsScreen',
  seamailScreen = 'SeamailScreen',
  seamailDetailsScreen = 'SeamailDetailsScreen',
  userProfileScreen = 'UserProfileScreen',
  seamailCreateScreen = 'SeamailCreateScreen',
}

// @TODO how can this be a thing? Should it be?
// export enum UserStackScreenComponents {
//   userProfileScreen = 'UserProfileScreen',
// }
