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
	var secondaryContentID: String?
	/// The account whose socket delivered the notification, so a tap can open it in that account.
	var accountID: String?
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
		if let secondaryContentID = secondaryContentID {
			dict["secondaryContentID"] = secondaryContentID
		}
		if let accountID = accountID {
			dict["accountID"] = accountID
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

struct WebsocketStatus: Codable {
	var accountID: String
	var state: String?
	var lastHealthcheckAt: Double?
	var lastHealthcheckSuccess: Bool?
	var lastError: String?
	var lastErrorAt: Double?
}

extension WebsocketStatus {
	var asDictionary: [String: Any] {
		var dict: [String: Any] = ["accountID": accountID]
		dict["state"] = state ?? NSNull()
		dict["lastHealthcheckAt"] = lastHealthcheckAt ?? NSNull()
		dict["lastHealthcheckSuccess"] = lastHealthcheckSuccess ?? NSNull()
		dict["lastError"] = lastError ?? NSNull()
		dict["lastErrorAt"] = lastErrorAt ?? NSNull()
		return dict
	}
}

/// One account the notification sockets are opened for. Mirrors `PushAccount` in
/// `src/Libraries/Notifications/Push/PushAccounts.ts`: JS hands the list over through
/// `syncPushAccounts`, and the same dictionaries travel to the extension in the provider configuration.
struct PushAccountConfig: Equatable {
	let accountID: String
	let userID: String
	let username: String
	let serverUrl: String
	let urlPrefix: String
	let token: String
	/// Keyed by `NotificationTypeData` raw value.
	let pushNotifications: [String: Bool]
	/// Epoch milliseconds until which notifications are muted, if they are.
	let muteNotificationsUntil: Double?
	/// The networks the account's server is reachable on.
	let wifiNetworkNames: [String]

	/// Fails for an entry that is disabled or has nothing to connect with.
	init?(dictionary: [String: Any]) {
		guard let accountID = dictionary["accountID"] as? String, !accountID.isEmpty,
			let serverUrl = dictionary["serverUrl"] as? String, !serverUrl.isEmpty,
			let token = dictionary["token"] as? String, !token.isEmpty,
			(dictionary["enabled"] as? Bool) != false
		else {
			return nil
		}
		let prefs = dictionary["prefs"] as? [String: Any]
		self.accountID = accountID
		self.userID = dictionary["userID"] as? String ?? ""
		self.username = dictionary["username"] as? String ?? ""
		self.serverUrl = serverUrl
		self.urlPrefix = dictionary["urlPrefix"] as? String ?? ""
		self.token = token
		self.pushNotifications = prefs?["pushNotifications"] as? [String: Bool] ?? [:]
		self.muteNotificationsUntil = prefs?["muteNotificationsUntil"] as? Double
		self.wifiNetworkNames = dictionary["wifiNetworkNames"] as? [String] ?? []
	}

	/// The same shape `init(dictionary:)` reads, using only property-list types so it can be stored
	/// in an `NEAppPushManager` provider configuration.
	var asDictionary: [String: Any] {
		var prefs: [String: Any] = ["pushNotifications": pushNotifications]
		if let muteNotificationsUntil = muteNotificationsUntil {
			prefs["muteNotificationsUntil"] = muteNotificationsUntil
		}
		return [
			"accountID": accountID,
			"userID": userID,
			"username": username,
			"serverUrl": serverUrl,
			"urlPrefix": urlPrefix,
			"token": token,
			"enabled": true,
			"prefs": prefs,
			"wifiNetworkNames": wifiNetworkNames,
		]
	}

	/// The ws(s):// URL of the Swiftarr notification socket.
	var socketURL: URL? {
		var string = serverUrl + urlPrefix + "/notification/socket"
		if string.hasPrefix("https://") {
			string = "wss://" + string.dropFirst("https://".count)
		}
		else if string.hasPrefix("http://") {
			string = "ws://" + string.dropFirst("http://".count)
		}
		return URL(string: string)
	}

	/// True when a change to `other` means the socket has to be reopened.
	func connectionDiffers(from other: PushAccountConfig?) -> Bool {
		return serverUrl != other?.serverUrl || urlPrefix != other?.urlPrefix || token != other?.token
	}

	/// Whether the user wants a notification of this type right now.
	func allowsNotification(_ type: NotificationTypeData, at date: Date = Date()) -> Bool {
		if pushNotifications[type.rawValue] == false {
			return false
		}
		if let muteNotificationsUntil = muteNotificationsUntil,
			date.timeIntervalSince1970 * 1000 < muteNotificationsUntil
		{
			return false
		}
		return true
	}

	/// The usable accounts in a list of account dictionaries (decoded JSON, or a provider configuration).
	static func list(from value: Any?) -> [PushAccountConfig] {
		guard let dictionaries = value as? [[String: Any]] else { return [] }
		return dictionaries.compactMap { PushAccountConfig(dictionary: $0) }
	}

	/// The usable accounts in the JSON array JS passes to `syncPushAccounts`.
	static func list(fromJson json: String) -> [PushAccountConfig] {
		guard let data = json.data(using: .utf8) else { return [] }
		return list(from: try? JSONSerialization.jsonObject(with: data))
	}
}

/// Normalized input used for building provider config and change detection.
struct PushManagerSettings {
	static let accountsKey = "accounts"

	let accounts: [PushAccountConfig]
	let matchSSIDs: [String]
	let enableDeveloperOptions: Bool
}

extension PushManagerSettings {
	/// Builds normalized settings from the synced accounts and AppConfig. The extension is one
	/// provider for every account, so it has to run on any network one of their servers is on.
	init(accounts: [PushAccountConfig], appConfig: AppConfigData) {
		var matchSSIDs: [String] = []
		for name in accounts.flatMap({ $0.wifiNetworkNames }) where !matchSSIDs.contains(name) {
			matchSSIDs.append(name)
		}
		self.accounts = accounts
		self.matchSSIDs = matchSSIDs
		self.enableDeveloperOptions = appConfig.enableDeveloperOptions
	}

	/// Builds the provider configuration dictionary for NEAppPushManager from normalized settings.
	var providerConfiguration: [String: Any] {
		return [
			Self.accountsKey: accounts.map { $0.asDictionary },
			"enableDeveloperOptions": enableDeveloperOptions,
		]
	}

	/// Returns true if the manager's current configuration differs from the given normalized settings.
	func hasManagerChanged(_ manager: NEAppPushManager) -> Bool {
		let current = manager.providerConfiguration
		let accountsChanged = PushAccountConfig.list(from: current[Self.accountsKey]) != accounts
		let ssidsChanged = Set(manager.matchSSIDs) != Set(matchSSIDs)
		let enableDeveloperOptionsChanged = (current["enableDeveloperOptions"] as? Bool) != enableDeveloperOptions

		return accountsChanged || ssidsChanged || enableDeveloperOptionsChanged
	}
}
