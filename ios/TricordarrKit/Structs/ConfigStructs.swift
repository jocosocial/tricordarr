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
	var overlapExcludeDurationHours: Int
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
struct AppConfigData: Codable {
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
	var manualTimeOffset: Int
	var wifiNetworkNames: [String]

	// Custom Codable implementation only for pushNotifications dictionary with enum keys
	enum CodingKeys: String, CodingKey {
		case serverUrl, urlPrefix, enableBackgroundWorker, notificationPollInterval
		case enableNotificationPolling, enableNotificationSocket, enableFezSocket
		case pushNotifications, fgsWorkerHealthTimer, oobeExpectedVersion
		case enableDeveloperOptions, enableExperiments, cruiseStartDate, cruiseLength
		case schedule, portTimeZoneID, apiClientConfig, enableEasterEgg
		case accessibility, muteNotifications, skipThumbnails, schedBaseUrl
		case userPreferences, markReadCancelPush, preRegistrationServerUrl
		case manualTimeOffset, wifiNetworkNames
	}

	init(from decoder: Decoder) throws {
		let container = try decoder.container(keyedBy: CodingKeys.self)

		// Decode all standard properties
		serverUrl = try container.decode(String.self, forKey: .serverUrl)
		urlPrefix = try container.decode(String.self, forKey: .urlPrefix)
		enableBackgroundWorker = try container.decode(Bool.self, forKey: .enableBackgroundWorker)
		notificationPollInterval = try container.decode(Int.self, forKey: .notificationPollInterval)
		enableNotificationPolling = try container.decode(Bool.self, forKey: .enableNotificationPolling)
		enableNotificationSocket = try container.decode(Bool.self, forKey: .enableNotificationSocket)
		enableFezSocket = try container.decode(Bool.self, forKey: .enableFezSocket)
		fgsWorkerHealthTimer = try container.decode(Int.self, forKey: .fgsWorkerHealthTimer)
		oobeExpectedVersion = try container.decode(Int.self, forKey: .oobeExpectedVersion)
		enableDeveloperOptions = try container.decode(Bool.self, forKey: .enableDeveloperOptions)
		enableExperiments = try container.decode(Bool.self, forKey: .enableExperiments)
		cruiseStartDate = try container.decode(String.self, forKey: .cruiseStartDate)
		cruiseLength = try container.decode(Int.self, forKey: .cruiseLength)
		schedule = try container.decode(ScheduleConfig.self, forKey: .schedule)
		portTimeZoneID = try container.decode(String.self, forKey: .portTimeZoneID)
		apiClientConfig = try container.decode(APIClientConfig.self, forKey: .apiClientConfig)
		enableEasterEgg = try container.decode(Bool.self, forKey: .enableEasterEgg)
		accessibility = try container.decode(AccessibilityConfig.self, forKey: .accessibility)
		muteNotifications = try container.decodeIfPresent(String.self, forKey: .muteNotifications)
		skipThumbnails = try container.decode(Bool.self, forKey: .skipThumbnails)
		schedBaseUrl = try container.decode(String.self, forKey: .schedBaseUrl)
		userPreferences = try container.decode(UserPreferences.self, forKey: .userPreferences)
		markReadCancelPush = try container.decode(Bool.self, forKey: .markReadCancelPush)
		preRegistrationServerUrl = try container.decode(String.self, forKey: .preRegistrationServerUrl)
		manualTimeOffset = try container.decode(Int.self, forKey: .manualTimeOffset)
		wifiNetworkNames = try container.decode([String].self, forKey: .wifiNetworkNames)

		// Decode pushNotifications as [String: Bool] and convert to [NotificationTypeData: Bool]
		let pushNotificationsDict = try container.decode([String: Bool].self, forKey: .pushNotifications)
		var pushNotificationsMap: [NotificationTypeData: Bool] = [:]
		for (key, value) in pushNotificationsDict {
			if let notificationType = NotificationTypeData(rawValue: key) {
				pushNotificationsMap[notificationType] = value
			}
		}
		pushNotifications = pushNotificationsMap
	}

	func encode(to encoder: Encoder) throws {
		var container = encoder.container(keyedBy: CodingKeys.self)

		// Encode all standard properties
		try container.encode(serverUrl, forKey: .serverUrl)
		try container.encode(urlPrefix, forKey: .urlPrefix)
		try container.encode(enableBackgroundWorker, forKey: .enableBackgroundWorker)
		try container.encode(notificationPollInterval, forKey: .notificationPollInterval)
		try container.encode(enableNotificationPolling, forKey: .enableNotificationPolling)
		try container.encode(enableNotificationSocket, forKey: .enableNotificationSocket)
		try container.encode(enableFezSocket, forKey: .enableFezSocket)
		try container.encode(fgsWorkerHealthTimer, forKey: .fgsWorkerHealthTimer)
		try container.encode(oobeExpectedVersion, forKey: .oobeExpectedVersion)
		try container.encode(enableDeveloperOptions, forKey: .enableDeveloperOptions)
		try container.encode(enableExperiments, forKey: .enableExperiments)
		try container.encode(cruiseStartDate, forKey: .cruiseStartDate)
		try container.encode(cruiseLength, forKey: .cruiseLength)
		try container.encode(schedule, forKey: .schedule)
		try container.encode(portTimeZoneID, forKey: .portTimeZoneID)
		try container.encode(apiClientConfig, forKey: .apiClientConfig)
		try container.encode(enableEasterEgg, forKey: .enableEasterEgg)
		try container.encode(accessibility, forKey: .accessibility)
		try container.encodeIfPresent(muteNotifications, forKey: .muteNotifications)
		try container.encode(skipThumbnails, forKey: .skipThumbnails)
		try container.encode(schedBaseUrl, forKey: .schedBaseUrl)
		try container.encode(userPreferences, forKey: .userPreferences)
		try container.encode(markReadCancelPush, forKey: .markReadCancelPush)
		try container.encode(preRegistrationServerUrl, forKey: .preRegistrationServerUrl)
		try container.encode(manualTimeOffset, forKey: .manualTimeOffset)
		try container.encode(wifiNetworkNames, forKey: .wifiNetworkNames)

		// Encode pushNotifications as [String: Bool]
		var pushNotificationsDict: [String: Bool] = [:]
		for (key, value) in pushNotifications {
			pushNotificationsDict[key.rawValue] = value
		}
		try container.encode(pushNotificationsDict, forKey: .pushNotifications)
	}
}
