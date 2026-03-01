//
//  NotificationStructs.swift
//  Tricordarr
//
//  Created by Grant Cohoe on 11/3/25.
//

import Foundation
import NetworkExtension

struct UserInfoData: Codable {
	var type: NotificationTypeData
	var url: String
	var markAsReadUrl: String?
}

extension UserInfoData {
	var asDictionary: [AnyHashable: Any] {
		var dict: [AnyHashable: Any] = [
			"type": type.rawValue,
			"url": url,
		]
		if let markAsReadUrl = markAsReadUrl {
			dict["markAsReadUrl"] = markAsReadUrl
		}
		return dict
	}
}

struct BackgroundPushManagerStatus: Codable {
	var isActive: Bool?
	var isEnabled: Bool?
	var matchSSIDs: [String]
	var providerConfiguration: [String: Any]?

	// Custom coding keys to exclude providerConfiguration from Codable
	enum CodingKeys: String, CodingKey {
		case isActive
		case isEnabled
		case matchSSIDs
	}
}

extension BackgroundPushManagerStatus {
	var asDictionary: [String: Any] {
		var dict: [String: Any] = [
			"matchSSIDs": matchSSIDs
		]
		if let isActive = isActive {
			dict["isActive"] = isActive
		}
		else {
			dict["isActive"] = NSNull()
		}
		if let isEnabled = isEnabled {
			dict["isEnabled"] = isEnabled
		}
		else {
			dict["isEnabled"] = NSNull()
		}
		if let providerConfiguration = providerConfiguration {
			// Serialize dictionary to JSON string for codegen compatibility
			if let jsonData = try? JSONSerialization.data(withJSONObject: providerConfiguration, options: []),
				let jsonString = String(data: jsonData, encoding: .utf8)
			{
				dict["providerConfiguration"] = jsonString
			}
			else {
				dict["providerConfiguration"] = NSNull()
			}
		}
		else {
			dict["providerConfiguration"] = NSNull()
		}
		return dict
	}
}

struct ForegroundPushProviderStatus: Codable {
	var lastPing: String?
	var isActive: Bool?
	var socketPingInterval: Double?
}

extension ForegroundPushProviderStatus {
	var asDictionary: [String: Any] {
		var dict: [String: Any] = [:]
		if let lastPing = lastPing {
			dict["lastPing"] = lastPing
		}
		else {
			dict["lastPing"] = NSNull()
		}
		if let isActive = isActive {
			dict["isActive"] = isActive
		}
		else {
			dict["isActive"] = NSNull()
		}
		if let socketPingInterval = socketPingInterval {
			dict["socketPingInterval"] = socketPingInterval
		}
		else {
			dict["socketPingInterval"] = NSNull()
		}
		return dict
	}
}

/// Normalized input used for building provider config and change detection.
struct PushManagerSettings {
  let socketUrl: String
  let token: String
  let matchSSIDs: [String]
  let pushNotifications: [String: Bool]
  /// ISO8601 date string for mute-until; stored as-is in provider config and parsed downstream (e.g. WebsocketNotifier).
  let muteNotifications: String?
  let enableDeveloperOptions: Bool
}

extension PushManagerSettings {
  /// Converts AppConfig pushNotifications map to the string-keyed dictionary stored in provider configuration.
  private static func pushNotificationsDictionary(from appConfigMap: [NotificationTypeData: Bool]) -> [String: Bool] {
    var result: [String: Bool] = [:]
    for (key, value) in appConfigMap {
      result[key.rawValue] = value
    }
    return result
  }

  /// Builds normalized settings from stored URL, token, and AppConfig.
  init(socketUrl: String, token: String, appConfig: AppConfigData) {
    let pushNotifications = Self.pushNotificationsDictionary(from: appConfig.pushNotifications)

    self.socketUrl = socketUrl
    self.token = token
    self.matchSSIDs = appConfig.wifiNetworkNames
    self.pushNotifications = pushNotifications
    self.muteNotifications = appConfig.muteNotifications
    self.enableDeveloperOptions = appConfig.enableDeveloperOptions
  }
  
  /// Builds the provider configuration dictionary for NEAppPushManager from normalized settings.
  var providerConfiguration: [String: Any] {
    var config: [String: Any] = [:]
    config["twitarrURL"] = self.socketUrl
    config["token"] = self.token
    config["pushNotifications"] = self.pushNotifications
    config["enableDeveloperOptions"] = self.enableDeveloperOptions
    if let muteNotifications = self.muteNotifications {
      config["muteNotifications"] = muteNotifications
    }
    return config
  }
  
  /// Returns true if the manager's current configuration differs from the given normalized settings.
  func hasManagerChanged(_ manager: NEAppPushManager) -> Bool {
    let current = manager.providerConfiguration
    let currentSocketUrl = current["twitarrURL"] as? String
    let currentToken = current["token"] as? String
    let currentMatchSSIDs = manager.matchSSIDs
    let currentPushNotifications = current["pushNotifications"] as? [String: Bool]
    let currentMuteNotifications = current["muteNotifications"] as? String
    let currentEnableDeveloperOptions = current["enableDeveloperOptions"] as? Bool

    let socketUrlChanged = currentSocketUrl != self.socketUrl
    let tokenChanged = currentToken != self.token
    let ssidsChanged = Set(currentMatchSSIDs) != Set(self.matchSSIDs)
    let pushNotificationsChanged = currentPushNotifications != self.pushNotifications
    let muteNotificationsChanged = currentMuteNotifications != self.muteNotifications
    let enableDeveloperOptionsChanged = currentEnableDeveloperOptions != self.enableDeveloperOptions

    return socketUrlChanged || tokenChanged || ssidsChanged || pushNotificationsChanged || muteNotificationsChanged
      || enableDeveloperOptionsChanged
  }
}
