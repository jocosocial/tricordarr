//
//  ConfigStructs.swift
//  Tricordarr
//
//  Created by Grant Cohoe on 11/4/25.
//

import Foundation

/// Structs that mimic the AppConfig on the JS side.
/// https://github.com/jocosocial/tricordarr/blob/main/src/Libraries/AppConfig.ts

/// API client configuration matching TypeScript APIClientConfig
struct APIClientConfig: Codable {
  var defaultPageSize: Int
  var canonicalHostnames: [String]
  var cacheBuster: String
  var cacheTime: Int
  var retry: Int
  var staleTime: Int
  var disruptionThreshold: Int
  var requestTimeout: Int
  var imageStaleTime: Int
}

/// Schedule configuration matching TypeScript ScheduleConfig
struct ScheduleConfig: Codable {
  var eventsShowJoinedLfgs: Bool
  var eventsShowOpenLfgs: Bool
  var hidePastLfgs: Bool
  var enableLateDayFlip: Bool
  var defaultLfgScreen: LfgStackComponents
}

/// Accessibility configuration matching TypeScript AccessibilityConfig
struct AccessibilityConfig: Codable {
  var useSystemTheme: Bool
  var darkMode: Bool
}

/// User preferences matching TypeScript UserPreferences
struct UserPreferences: Codable {
  var reverseSwipeOrientation: Bool
  var defaultForumSortOrder: ForumSort?
  var defaultForumSortDirection: ForumSortDirection?
  var highlightForumAlertWords: Bool
  var autosavePhotos: Bool
}

/// App configuration matching TypeScript AppConfig
struct AppConfig: Codable {
  var serverUrl: String
  var urlPrefix: String
  var enableBackgroundWorker: Bool
  var notificationPollInterval: Int
  var enableNotificationPolling: Bool
  var enableNotificationSocket: Bool
  var enableFezSocket: Bool
  var pushNotifications: [NotificationTypeData: Bool]
  var fgsWorkerHealthTimer: Int
  var oobeExpectedVersion: Int
  var oobeCompletedVersion: Int
  var enableDeveloperOptions: Bool
  var enableExperiments: Bool
  var cruiseStartDate: String  // Stored as ISO8601 string, will be converted to Date on read
  var cruiseLength: Int
  var schedule: ScheduleConfig
  var portTimeZoneID: String
  var apiClientConfig: APIClientConfig
  var enableEasterEgg: Bool
  var accessibility: AccessibilityConfig
  var muteNotifications: String?  // Stored as ISO8601 string, will be converted to Date on read
  var skipThumbnails: Bool
  var schedBaseUrl: String
  var userPreferences: UserPreferences
  var markReadCancelPush: Bool
  var preRegistrationServerUrl: String
  var preRegistrationEndDate: String  // Stored as ISO8601 string, will be converted to Date on read
  var manualTimeOffset: Int
  var wifiNetworkNames: [String]
}
